import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL não configurada.");
}

if (!supabaseSecretKey) {
  throw new Error("SUPABASE_SECRET_KEY não configurada.");
}

if (supabaseSecretKey.startsWith("sb_publishable_")) {
  throw new Error(
    "SUPABASE_SECRET_KEY recebeu uma chave publicável. Use uma chave sb_secret_ somente no backend.",
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);
