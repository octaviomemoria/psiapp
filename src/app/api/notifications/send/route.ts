import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey } from '@/lib/supabase/client';
import { dispatchNotification } from '@/lib/notifications/dispatcher';
import { validateNotificationPayload, recipientBelongsToPatients, RateLimiter } from '@/lib/notifications/authorize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const limiter = new RateLimiter(20, 60_000); // 20 envios por minuto por usuário

/**
 * Envio de notificação (WhatsApp/e-mail). POST /api/notifications/send
 * Exige o token de acesso do Supabase (Authorization: Bearer ...) de um psicólogo e só envia
 * a pacientes desse psicólogo. Antes era um endpoint aberto que qualquer pessoa da internet
 * podia usar para disparar mensagens em nome da plataforma.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return NextResponse.json({ error: 'Autenticação obrigatória.' }, { status: 401 });
  }

  // Cliente que age COMO o usuário: todas as consultas abaixo passam pelo RLS dele.
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) {
      return NextResponse.json({ error: 'Sessão inválida ou expirada.' }, { status: 401 });
    }

    const { data: profile } = await userClient.from('profiles').select('role').eq('user_id', user.id).maybeSingle();
    if (!profile || profile.role !== 'psychologist') {
      return NextResponse.json({ error: 'Apenas psicólogos podem enviar notificações.' }, { status: 403 });
    }

    if (!limiter.allow(user.id)) {
      return NextResponse.json({ error: 'Muitos envios em pouco tempo. Aguarde um minuto.' }, { status: 429 });
    }

    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
    }

    const validation = validateNotificationPayload(raw);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { data: patients, error: patientsError } = await userClient.from('patients').select('email, phone').limit(2000);
    if (patientsError) {
      console.error('Erro ao validar destinatário:', patientsError.message);
      return NextResponse.json({ error: 'Não foi possível validar o destinatário.' }, { status: 500 });
    }

    if (!recipientBelongsToPatients(validation.payload, patients || [])) {
      return NextResponse.json({ error: 'O destinatário não é um paciente seu.' }, { status: 403 });
    }

    const result = await dispatchNotification(validation.payload);
    return NextResponse.json({ success: true, result, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Erro ao despachar notificação:', error);
    return NextResponse.json({ error: 'Falha interna no envio de notificação.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'online' });
}
