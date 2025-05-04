import { createClient } from '@supabase/supabase-js';

// Substitua estas variáveis pelas suas credenciais do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cria um cliente Supabase para ser usado em toda a aplicação
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 