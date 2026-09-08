import { NextRequest, NextResponse } from 'next/server';
import { dispatchNotification, NotificationPayload } from '@/lib/notifications/dispatcher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as NotificationPayload;

    if (!payload.recipientName || !payload.template) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes (recipientName, template).' },
        { status: 400 }
      );
    }

    const result = await dispatchNotification(payload);

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro ao despachar notificação:', error);
    return NextResponse.json(
      { error: 'Falha interna no envio de notificação.', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'PsiApp Multichannel Notification Service (WhatsApp + Resend Email)',
    timestamp: new Date().toISOString(),
  });
}
