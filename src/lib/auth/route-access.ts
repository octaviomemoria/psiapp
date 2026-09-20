/**
 * Regras de acesso às áreas do app por papel (role), separadas do middleware para serem testáveis.
 * O papel vem de `profiles.role`, que só um administrador consegue conceder (migração 07).
 */
export type AppRole = 'psychologist' | 'patient' | 'manager' | 'superadmin' | 'admin' | 'supervisor';

/** Áreas protegidas e quais papéis podem entrar em cada uma. Todo o resto (/, /termos, /validar/...) é público. */
export const PROTECTED_AREAS: Record<string, AppRole[]> = {
  '/psicologo': ['psychologist'],
  '/paciente': ['patient'],
  '/gerente': ['manager', 'admin'],
  '/superadmin': ['superadmin'],
};

const ROLE_HOME: Partial<Record<AppRole, string>> = {
  psychologist: '/psicologo/dashboard',
  patient: '/paciente/inicio',
  manager: '/gerente/dashboard',
  admin: '/gerente/dashboard',
  superadmin: '/superadmin/dashboard',
};

export const LOGIN_REDIRECT = '/?auth=required';

/** Normaliza o caminho para comparação: minúsculas, sem barras duplicadas nem barra final. */
export function normalizePath(pathname: string): string {
  const collapsed = pathname.toLowerCase().replace(/\/{2,}/g, '/');
  return collapsed.length > 1 ? collapsed.replace(/\/+$/, '') : collapsed;
}

/** Devolve os papéis permitidos se o caminho estiver numa área protegida; null se for público. */
export function protectedAreaFor(pathname: string): AppRole[] | null {
  const path = normalizePath(pathname);
  for (const [prefix, roles] of Object.entries(PROTECTED_AREAS)) {
    if (path === prefix || path.startsWith(prefix + '/')) return roles;
  }
  return null;
}

export function homeForRole(role: string | null | undefined): string {
  return (role && ROLE_HOME[role as AppRole]) || '/';
}

export type AccessDecision = { type: 'allow' } | { type: 'redirect'; to: string };

/**
 * `hasSession`: o Supabase confirmou o usuário (não basta existir um cookie).
 * `role`: papel em `profiles`, ou null se o perfil não foi encontrado/consulta falhou.
 * Sem certeza, nega: a rota só abre para quem comprovadamente tem o papel exigido.
 */
export function decideAccess(input: { pathname: string; hasSession: boolean; role: string | null }): AccessDecision {
  const allowedRoles = protectedAreaFor(input.pathname);
  if (!allowedRoles) return { type: 'allow' };

  if (!input.hasSession || !input.role) return { type: 'redirect', to: LOGIN_REDIRECT };

  if (allowedRoles.includes(input.role as AppRole)) return { type: 'allow' };

  // Logado, mas na área errada: manda para a área do próprio papel (nunca de volta para a mesma, evitando laço).
  const home = homeForRole(input.role);
  return { type: 'redirect', to: protectedAreaFor(home)?.includes(input.role as AppRole) || home === '/' ? home : '/' };
}
