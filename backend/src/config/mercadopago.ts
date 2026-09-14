import { MercadoPagoConfig } from "mercadopago";

// Mantém uma única instância do cliente durante a vida do servidor.
let client: MercadoPagoConfig | null = null;

// Cria o cliente sob demanda apenas quando alguma ação de pagamento é solicitada.
export function getMercadoPagoClient() {
  if (client) return client;

  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      "MP_ACCESS_TOKEN não configurada. Crie uma aplicação de teste em https://www.mercadopago.com.br/developers/panel/app e configure o .env.",
    );
  }

  client = new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } });
  return client;
}

// URLs usadas pelo Mercado Pago para redirecionar o comprador e chamar o webhook.
export function getFrontendUrl() {
  return process.env.FRONTEND_URL || "http://localhost:5173";
}

export function getBackendUrl() {
  return process.env.BACKEND_URL || "http://localhost:3000";
}
