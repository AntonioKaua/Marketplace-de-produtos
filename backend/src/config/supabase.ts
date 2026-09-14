import { createClient } from "@supabase/supabase-js";

// Estas credenciais existem somente no backend. A chave secreta não pode ir ao frontend.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// Falhar ao iniciar é mais seguro do que executar consultas sem configuração válida.
if (!supabaseUrl) {
  throw new Error("SUPABASE_URL não configurada.");
}

if (!supabaseSecretKey) {
  throw new Error("SUPABASE_SECRET_KEY não configurada.");
}

// Impede usar acidentalmente uma chave pública onde o backend precisa da chave de serviço.
if (supabaseSecretKey.startsWith("sb_publishable_")) {
  throw new Error(
    "SUPABASE_SECRET_KEY recebeu uma chave publicável. Use uma chave sb_secret_ somente no backend.",
  );
}

// Cliente compartilhado por todos os services para acessar banco e Storage.
// As opções desativam o Supabase Auth, pois este projeto usa JWT próprio.
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
