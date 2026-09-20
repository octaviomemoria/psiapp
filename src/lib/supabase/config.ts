// Configuração pública do Supabase, sem instanciar nenhum cliente (usável no middleware/Edge).
// A chave anon é pública por desenho: quem protege os dados é o RLS do banco.
const defaultSupabaseUrl = 'https://nlgnlngjinpqwxzpwzis.supabase.co';
const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZ25sbmdqaW5wcXd4enB3emlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwOTkwOTgsImV4cCI6MjEwMzY3NTA5OH0.XI4feVYqf08kXJ6RLpcy80zcOIWIcVmGSOpm56aet_s';

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder')
);
