import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateFullIcalFeed } from '@/lib/calendar/calendar-utils';
import { Appointment } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const psychologistId = searchParams.get('psychologistId');
  const token = searchParams.get('token');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new NextResponse('Configuração de servidor indisponível', { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    let query = supabase
      .from('appointments')
      .select('*, patient:patients(full_name)')
      .in('status', ['scheduled', 'confirmed']);

    if (psychologistId) {
      query = query.eq('psychologist_id', psychologistId);
    }

    const { data: appointmentsData, error } = await query;

    if (error) {
      console.error('Erro ao buscar agendamentos para o feed iCal:', error);
      return new NextResponse('Erro ao gerar calendário', { status: 500 });
    }

    // Mapear dados para o formato de agendamento
    const appointments: Appointment[] = (appointmentsData || []).map((a: any) => ({
      id: a.id,
      psychologist_id: a.psychologist_id,
      patient_id: a.patient_id,
      patient_name: a.patient?.full_name || a.patient_name || 'Paciente',
      starts_at: a.starts_at,
      ends_at: a.ends_at,
      modality: a.modality || 'online',
      location_or_link: a.location_or_link || (a.modality === 'online' ? 'Teleatendimento Online' : 'Consultório'),
      status: a.status,
      notes: a.notes,
      created_at: a.created_at,
      updated_at: a.updated_at,
    }));

    const icsContent = generateFullIcalFeed(appointments, 'PsiApp');

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="psiapp-agenda.ics"',
        'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Exceção ao gerar feed iCal:', err);
    return new NextResponse('Erro interno', { status: 500 });
  }
}
