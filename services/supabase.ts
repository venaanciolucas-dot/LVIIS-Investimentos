
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  try {
    return (typeof process !== 'undefined' && process.env?.[key]) || '';
  } catch {
    return '';
  }
};

// As chaves são injetadas pelo ambiente (Vercel/Vite) conforme fornecido no briefing
const supabaseUrl = getEnv('SUPABASE_URL') || 'https://gnlysviamgnbgeishwvh.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 'sb_publishable_6b56ZzRbzeyFFtucKPBEDA_8V1LlsRf';

export const isSupabaseConfigured = 
  !!supabaseUrl && 
  supabaseUrl.startsWith('https://') && 
  !supabaseUrl.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
