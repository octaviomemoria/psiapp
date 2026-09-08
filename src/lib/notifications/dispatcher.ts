/**
 * Disparador Multicanal de Notificações Transacionais (E-mail Resend & WhatsApp API)
 * Envia confirmações de sessão, lembretes antifalta (24h e 2h) e recibos Pix.
 */

export interface NotificationPayload {
  channel: 'email' | 'whatsapp' | 'both';
  recipientName: string;
  recipientEmail?: string;
  recipientPhone?: string; // Formato +5511999998888 ou 11999998888
  template: 'session_reminder_24h' | 'session_reminder_2h' | 'booking_confirmed' | 'pix_receipt';
  data: {
    psychologistName: string;
    crp?: string;
    sessionDate: string;
    sessionTime: string;
    telehealthLink?: string;
    amount?: number;
    receiptHash?: string;
    clinicName?: string;
  };
}

export interface NotificationResult {
  success: boolean;
  channel: 'email' | 'whatsapp' | 'both';
  emailStatus?: 'sent' | 'skipped_no_credentials' | 'failed';
  whatsappStatus?: 'sent' | 'skipped_no_credentials' | 'failed';
  messageId?: string;
  renderedText: string;
}

/**
 * Renderiza a mensagem textual padrão de acordo com o template
 */
export function renderNotificationMessage(payload: NotificationPayload): string {
  const { template, recipientName, data } = payload;
  const clinic = data.clinicName || 'PsiApp Saúde Mental';

  switch (template) {
    case 'session_reminder_24h':
      return `Olá, ${recipientName}! 🌿\n\nLembramos que sua consulta com ${data.psychologistName} está confirmada para amanhã, ${data.sessionDate} às ${data.sessionTime}.\n\nSe precisar reagendar, por favor avise com antecedência. Até breve!\n\n— ${clinic}`;

    case 'session_reminder_2h':
      const linkText = data.telehealthLink
        ? `\n\nLink da sala virtual segura:\n${data.telehealthLink}`
        : '';
      return `Olá, ${recipientName}! ⏰\n\nSua sessão de psicoterapia com ${data.psychologistName} começará em 2 horas (${data.sessionTime}).${linkText}\n\nRecomendamos conectar-se 5 minutos antes em um ambiente privativo com fones de ouvido.\n\n— ${clinic}`;

    case 'booking_confirmed':
      return `Olá, ${recipientName}! ✅\n\nSeu agendamento com ${data.psychologistName} foi confirmado para ${data.sessionDate} às ${data.sessionTime}.\n\nEstamos prontos para acolhê-lo(a)!\n\n— ${clinic}`;

    case 'pix_receipt':
      return `Olá, ${recipientName}! 🧾\n\nConfirmamos o recebimento dos seus honorários no valor de R$ ${(data.amount || 0).toFixed(2).replace('.', ',')} para a sessão de ${data.sessionDate}.\n\nSeu recibo com autenticidade digital CFP nº ${data.receiptHash || 'N/A'} está disponível no aplicativo.\n\n— ${clinic}`;

    default:
      return `Olá, ${recipientName}! Você possui uma nova notificação em seu prontuário no PsiApp.`;
  }
}

/**
 * Dispara notificação via WhatsApp (Z-API / Evolution / Twilio)
 */
export async function sendWhatsApp(
  phone: string,
  message: string
): Promise<{ status: 'sent' | 'skipped_no_credentials' | 'failed'; messageId?: string }> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const clientToken = process.env.WHATSAPP_CLIENT_TOKEN;

  // Sanitiza número de telefone
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) {
    return { status: 'failed' };
  }

  // Se não houver credenciais reais configuradas no ambiente, simula com sucesso e log seguro
  if (!apiUrl || !clientToken || apiUrl.includes('sua-instancia')) {
    console.info(`[WHATSAPP-DISPATCH] (Modo Simulação/Sandbox) Para: +55${cleanPhone} | Mensagem:\n${message}`);
    return {
      status: 'skipped_no_credentials',
      messageId: `sim_wa_${Date.now()}`,
    };
  }

  try {
    const res = await fetch(`${apiUrl}/send-text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': clientToken,
      },
      body: JSON.stringify({
        phone: cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`,
        message,
      }),
    });

    if (!res.ok) {
      console.warn(`[WHATSAPP-ERROR] Resposta da API: ${res.status}`);
      return { status: 'failed' };
    }

    const data = await res.json();
    return { status: 'sent', messageId: data.id || data.messageId };
  } catch (err) {
    console.error('[WHATSAPP-EXCEPTION]', err);
    return { status: 'failed' };
  }
}

/**
 * Dispara notificação por E-mail via Resend
 */
export async function sendEmail(
  to: string,
  subject: string,
  message: string
): Promise<{ status: 'sent' | 'skipped_no_credentials' | 'failed'; messageId?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || 'PsiApp <notificacoes@psiapp.com.br>';

  if (!resendApiKey || resendApiKey.startsWith('re_1234')) {
    console.info(`[RESEND-DISPATCH] (Modo Simulação/Sandbox) Para: ${to} | Assunto: ${subject}`);
    return {
      status: 'skipped_no_credentials',
      messageId: `sim_email_${Date.now()}`,
    };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [to],
        subject,
        text: message,
      }),
    });

    if (!res.ok) {
      console.warn(`[RESEND-ERROR] Resposta da API Resend: ${res.status}`);
      return { status: 'failed' };
    }

    const data = await res.json();
    return { status: 'sent', messageId: data.id };
  } catch (err) {
    console.error('[RESEND-EXCEPTION]', err);
    return { status: 'failed' };
  }
}

/**
 * Despachante Principal
 */
export async function dispatchNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const renderedText = renderNotificationMessage(payload);
  let emailStatus: NotificationResult['emailStatus'];
  let whatsappStatus: NotificationResult['whatsappStatus'];

  if ((payload.channel === 'whatsapp' || payload.channel === 'both') && payload.recipientPhone) {
    const waResult = await sendWhatsApp(payload.recipientPhone, renderedText);
    whatsappStatus = waResult.status;
  }

  if ((payload.channel === 'email' || payload.channel === 'both') && payload.recipientEmail) {
    const subjectMap: Record<NotificationPayload['template'], string> = {
      session_reminder_24h: 'Lembrete de Sessão: Amanhã no PsiApp',
      session_reminder_2h: 'Sua sessão começa em 2 horas — Sala Virtual PsiApp',
      booking_confirmed: 'Confirmação de Agendamento — PsiApp',
      pix_receipt: 'Recibo de Honorários Psicológicos — PsiApp',
    };
    const subject = subjectMap[payload.template] || 'Notificação PsiApp';
    const emailResult = await sendEmail(payload.recipientEmail, subject, renderedText);
    emailStatus = emailResult.status;
  }

  return {
    success: true,
    channel: payload.channel,
    emailStatus,
    whatsappStatus,
    renderedText,
  };
}
