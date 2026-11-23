import { Capacitor } from "@capacitor/core";
import { AppLauncher } from "@capacitor/app-launcher";

export const isNativeApp = Capacitor.isNativePlatform();

export async function openCheckout(url, orderId, navigate) {
  const target = new URL(url);
  if (target.protocol !== "https:") throw new Error("Link de pagamento inválido.");
  if (!isNativeApp) {
    window.location.assign(target.href);
    return;
  }
  const { completed } = await AppLauncher.openUrl({ url: target.href });
  if (!completed) throw new Error("Não foi possível abrir o navegador para pagamento.");
  // A sessão do app permanece na WebView; a confirmação vem da API,
  // independentemente do redirecionamento no navegador do pagamento.
  navigate(`/checkout/pending?external_reference=${encodeURIComponent(orderId)}`);
}
