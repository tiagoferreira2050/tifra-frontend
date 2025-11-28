// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Faz a resolução de variáveis tanto para CLIENT (NEXT_PUBLIC_...)
 * quanto para SERVER (SUPABASE_...).
 *
 * Se faltar alguma variável, lançamos um erro claro durante o build.
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  // lançamos erro explícito para o build falhar com mensagem legível
  throw new Error(
    "Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_URL and SUPABASE_ANON_KEY) in your environment."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
