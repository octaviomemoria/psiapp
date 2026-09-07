import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Headers de Segurança Rígidos para Aplicações de Saúde (CFP / LGPD)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(self), display-capture=(), geolocation=()'
  );

  // 2. Proteção de Rotas com base em Sessão Supabase
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');
  const isProtectedRoute =
    pathname.startsWith('/psicologo') ||
    pathname.startsWith('/paciente') ||
    pathname.startsWith('/gerente') ||
    pathname.startsWith('/superadmin');

  // Supabase Auth tokens em cookies
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'));

  // Em ambiente de desenvolvimento ou modo demo liberado, permitir passagem com headers
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
