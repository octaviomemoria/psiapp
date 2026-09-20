import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { generateFullIcalFeed } from '@/lib/calendar/calendar-utils';
import { Appointment } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TOKEN_RE = /^[0-9a-f]{64}$/i;

// Cabeçalhos comuns: a URL contém um segredo, então nada pode ser cacheado, indexado ou vazar por Referer.
const PRIVATE_HEADERS = {
  'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow',
};

function notFound() {
  // Resposta idêntica para token ausente, malformado ou inexistente: não revela se o token "quase" existe.
  return new NextResponse('Agenda não encontrada', { status: 404, headers: PRIVATE_HEADERS });
}

/**
 * Feed iCal (assinatura de agenda no iPhone/Google).
 * Exige o token secreto do psicólogo (?token=...). Não existe mais consulta por psychologistId:
 * antes, sem parâmetro algum, o endpoint devolvia a agenda de todos os psicólogos.
 * A leitura é feita pela função get_calendar_feed do banco, que só devolve dados do dono do token
 * e não depende da service_role.
 */
export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token');
  if (!token || !TOKEN_RE.test(token)) return notFound();

  if (!supabase) {
    return new NextResponse('Configuração de servidor indisponível', { status: 500, headers: PRIVATE_HEADERS });
  }

  try {
    const { data, error } = await supabase.rpc('get_calendar_feed', { p_token: token });

    if (error) {
      console.error('Erro ao gerar o feed iCal:', error.message);
      return new NextResponse('Erro ao gerar calendário', { status: 500, headers: PRIVATE_HEADERS });
    }

    const rows = (data || []) as any[];
    // Token inexistente e agenda vazia são indistinguíveis aqui; para agenda vazia devolvemos calendário vazio.
    const appointments: Appointment[] = rows.map(a => ({
      id: a.id,
      psychologist_id: '',
      patient_id: '',
      patient_name: a.patient_name || 'Paciente',
      starts_at: a.starts_at,
      ends_at: a.ends_at,
      modality: a.modality || 'online',
      location_or_link: a.location_or_link || (a.modality === 'online' ? 'Teleatendimento Online' : 'Consultório'),
      status: a.status,
    }));

    const psychologistName = rows[0]?.psychologist_name as string | undefined;
    const icsContent = generateFullIcalFeed(appointments, psychologistName || 'PsiApp');

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="psiapp-agenda.ics"',
      },
    });
  } catch (err: any) {
    console.error('Exceção ao gerar feed iCal:', err);
    return new NextResponse('Erro interno', { status: 500, headers: PRIVATE_HEADERS });
  }
}
