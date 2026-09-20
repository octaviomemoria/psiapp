import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from '@/lib/supabase/config';
import { decideAccess, protectedAreaFor, LOGIN_REDIRECT } from '@/lib/auth/route-access';

/** Headers de segurança para aplicações de saúde (CFP / LGPD). */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(self), display-capture=(), geolocation=()');
  return response;
}

function redirectTo(request: NextRequest, to: string, cookiesFrom?: NextResponse): NextResponse {
  const response = NextResponse.redirect(new URL(to, request.url));
  // Preserva cookies de sessão renovados durante a verificação
  cookiesFrom?.cookies.getAll().forEach(c => response.cookies.set(c));
  response.headers.set('Cache-Control', 'no-store');
  return applySecurityHeaders(response);
}

/**
 * Proteção de rotas na borda: as áreas /psicologo, /paciente, /gerente e /superadmin só são entregues a
 * quem tem sessão válida E o papel correspondente em `profiles.role`. Antes, o middleware calculava
 * `hasAuthCookie` e não fazia nada com ele — toda a proteção estava no navegador.
 *
 * Importante: isto é uma camada extra. A barreira real dos dados continua sendo o RLS do banco.
 */
export async function middleware(request: NextRequest) {
  let response = applySecurityHeaders(NextResponse.next({ request }));

  const pathname = request.nextUrl.pathname;
  if (!protectedAreaFor(pathname)) return response; // rota pública: só headers, sem consulta ao Supabase

  // Sem cookie de sessão do Supabase não há o que verificar: nega sem chamar a rede.
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
  if (!hasAuthCookie || !isSupabaseConfigured) {
    return redirectTo(request, LOGIN_REDIRECT);
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: cookiesToSet => {
          // O Supabase pode renovar o token; o cookie novo precisa ir na requisição e na resposta.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = applySecurityHeaders(NextResponse.next({ request }));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    // getUser() confirma o token no servidor de autenticação (getSession() só leria o cookie, que pode ser forjado).
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;

    let role: string | null = null;
    if (user && !userError) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).maybeSingle();
      role = profile?.role ?? null;
    }

    const decision = decideAccess({ pathname, hasSession: Boolean(user) && !userError, role });
    if (decision.type === 'redirect') return redirectTo(request, decision.to, response);

    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch (err) {
    console.error('[middleware] falha ao verificar a sessão; acesso negado por precaução:', err);
    return redirectTo(request, LOGIN_REDIRECT);
  }
}

export const config = {
  matcher: [
    /*
     * Todas as rotas, exceto:
     * - api (têm autenticação própria)
     * - _next/static, _next/image e favicon.ico
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
