import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointment, accessToken } = body;

    if (!appointment) {
      return NextResponse.json({ error: 'Dados do agendamento ausentes' }, { status: 400 });
    }

    if (!accessToken) {
      return NextResponse.json({
        configured: false,
        message: 'Conta Google não conectada. Utilize a sincronização direta de 1-clique ou o Feed iCal nativo.'
      }, { status: 200 });
    }

    const eventPayload = {
      summary: `Sessão de Psicoterapia: ${appointment.patient_name || 'Paciente'}`,
      description: `Consulta clínica com psicólogo(a). [PsiApp]\nObs: ${appointment.notes || 'Nenhuma'}`,
      start: {
        dateTime: appointment.starts_at,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: appointment.ends_at,
        timeZone: 'America/Sao_Paulo',
      },
      location: appointment.location_or_link || (appointment.modality === 'online' ? 'Online TDIC' : 'Consultório'),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 15 },
          { method: 'email', minutes: 60 }
        ]
      }
    };

    const googleRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventPayload)
    });

    const googleData = await googleRes.json();

    if (!googleRes.ok) {
      return NextResponse.json({ error: googleData.error?.message || 'Erro no Google Calendar API' }, { status: googleRes.status });
    }

    return NextResponse.json({ success: true, event: googleData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
