
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    return (window as any).process?.env?.[key] || (import.meta as any).env?.[key] || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Verifica se as chaves são URLs válidas e não placeholders
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('placeholder-url');

// Só inicializa se estiver configurado, senão retorna um proxy que não faz nada
// Isso evita o erro "Falha ao buscar" (Failed to fetch) ao carregar o app
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
