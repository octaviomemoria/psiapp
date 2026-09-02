import { Appointment } from '@/types/database';

/**
 * Formata uma data ISO para o padrão exigido pelo iCalendar e Google Calendar (YYYYMMDDTHHmmssZ em UTC)
 */
export function formatCalendarDateUtc(isoDate: string): string {
  const d = new Date(isoDate);
  return d
    .toISOString()
    .replace(/-|:|\.\d+/g, '');
}

/**
 * Gera URL direta para adicionar consulta no Google Agenda em 1 clique
 */
export function generateGoogleCalendarUrl(appointment: Appointment, psychologistName?: string): string {
  const title = encodeURIComponent(`Sessão de Psicoterapia — ${appointment.patient_name || 'Paciente'}`);
  const startUtc = formatCalendarDateUtc(appointment.starts_at);
  const endUtc = formatCalendarDateUtc(appointment.ends_at);
  
  const descriptionText = [
    `Atendimento clínico com ${psychologistName || 'Psicólogo(a)'}.`,
    appointment.modality === 'online' ? `\n🔗 Link da Teleconsulta: ${appointment.location_or_link || 'A definir'}` : `\n📍 Local: ${appointment.location_or_link || 'Consultório presencial'}`,
    appointment.notes ? `\n📝 Observações: ${appointment.notes}` : '',
    '\n\nGerado automaticamente via PsiApp — Acompanhamento Terapêutico & Evolução Clínica'
  ].filter(Boolean).join('');

  const details = encodeURIComponent(descriptionText);
  const location = encodeURIComponent(appointment.location_or_link || (appointment.modality === 'online' ? 'Teleconsulta Online' : 'Consultório Presencial'));

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}&sf=true&output=xml`;
}

/**
 * Gera o conteúdo no formato RFC 5545 (.ics) para uma única sessão
 */
export function generateSingleIcsContent(appointment: Appointment, psychologistName?: string): string {
  const uid = `appointment-${appointment.id}@psiappgestao.vercel.app`;
  const dtStamp = formatCalendarDateUtc(new Date().toISOString());
  const dtStart = formatCalendarDateUtc(appointment.starts_at);
  const dtEnd = formatCalendarDateUtc(appointment.ends_at);
  const summary = `Sessão de Psicoterapia — ${appointment.patient_name || 'Paciente'}`;
  const location = appointment.location_or_link || (appointment.modality === 'online' ? 'Teleatendimento Online' : 'Consultório');
  const description = `Atendimento clínico com ${psychologistName || 'Psicólogo(a)'}. ${appointment.notes ? 'Obs: ' + appointment.notes : ''} [PsiApp]`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PsiApp//Agenda Clinica//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Lembrete: Sessão de Psicoterapia em 15 minutos',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Faz o download do arquivo .ics no navegador do usuário
 */
export function downloadIcsFile(appointment: Appointment, psychologistName?: string): void {
  const icsContent = generateSingleIcsContent(appointment, psychologistName);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `sessao-${appointment.patient_name ? appointment.patient_name.toLowerCase().replace(/\s+/g, '-') : 'consulta'}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Gera um feed iCalendar RFC 5545 contendo múltiplos agendamentos para assinatura contínua
 */
export function generateFullIcalFeed(appointments: Appointment[], psychologistName?: string): string {
  const dtStamp = formatCalendarDateUtc(new Date().toISOString());
  
  const events = appointments.map(a => {
    const uid = `appointment-${a.id}@psiappgestao.vercel.app`;
    const dtStart = formatCalendarDateUtc(a.starts_at);
    const dtEnd = formatCalendarDateUtc(a.ends_at);
    const summary = `Sessão: ${a.patient_name || 'Paciente'}`;
    const location = a.location_or_link || (a.modality === 'online' ? 'Online' : 'Consultório');
    const description = `Paciente: ${a.patient_name || 'Não informado'} | Modalidade: ${a.modality === 'online' ? 'Online' : 'Presencial'} | PsiApp`;

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT30M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Lembrete de Sessão de Psicoterapia',
      'END:VALARM',
      'END:VEVENT'
    ].join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PsiApp//Agenda Clinica Profissional//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:PsiApp - Agenda ${psychologistName || 'Clínica'}`,
    'X-WR-TIMEZONE:America/Sao_Paulo',
    events,
    'END:VCALENDAR'
  ].join('\r\n');
}
