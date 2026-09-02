import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://psiappgestao.vercel.app';

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}?calendar_sync_error=${encodeURIComponent(error || 'Código de autorização não fornecido')}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/calendar/google/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Erro na troca de token Google OAuth:', tokenData);
      return NextResponse.redirect(`${appUrl}?calendar_sync_error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
    }

    // Sucesso! Retorna para o app com indicador de sucesso
    return NextResponse.redirect(`${appUrl}?google_calendar_connected=true`);
  } catch (err: any) {
    console.error('Erro ao conectar Google Calendar:', err);
    return NextResponse.redirect(`${appUrl}?calendar_sync_error=Falha+de+comunicacao+com+Google`);
  }
}
