import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const psychologistId = searchParams.get('psychologistId');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'https://psiappgestao.vercel.app'}/api/calendar/google/callback`;

  if (!clientId) {
    return NextResponse.json({
      configured: false,
      message: 'GOOGLE_CLIENT_ID não configurado no ambiente. Adicione suas credenciais no painel de configurações para habilitar OAuth bidirecional.'
    }, { status: 200 });
  }

  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events');
  const state = encodeURIComponent(JSON.stringify({ psychologistId }));

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

  return NextResponse.redirect(authUrl);
}
