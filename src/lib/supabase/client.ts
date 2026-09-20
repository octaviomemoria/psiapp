import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey, isSupabaseConfigured } from './config';

export { supabaseUrl, supabaseAnonKey, isSupabaseConfigured };

// No navegador a sessão fica em cookies (createBrowserClient), que o middleware consegue ler para proteger as
// rotas; com localStorage o servidor nunca enxerga o login. Fora do navegador (rotas de API, testes) não há cookies.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? (typeof window !== 'undefined'
      ? createBrowserClient(supabaseUrl, supabaseAnonKey)
      : createClient(supabaseUrl, supabaseAnonKey))
  : null;
