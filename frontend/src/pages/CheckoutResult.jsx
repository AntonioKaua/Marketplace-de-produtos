import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Clock3, ShieldAlert, ShieldCheck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { getOrderPaymentStatusRequest } from "../services/orders";

const VARIANTS = {
  success: {
    icon: ShieldCheck,
    color: "text-emerald-600",
    title: "Pagamento em processamento",
    description: "Assim que o Mercado Pago confirmar o pagamento, seu pedido será atualizado automaticamente.",
  },
  failure: {
    icon: ShieldAlert,
    color: "text-red-600",
    title: "Pagamento não aprovado",
    description: "Não foi possível concluir o pagamento. Você pode tentar novamente pelos seus pedidos.",
  },
  pending: {
    icon: Clock3,
    color: "text-amber-600",
    title: "Pagamento pendente",
    description: "Recebemos seu pedido e estamos aguardando a confirmação do pagamento. Se você escolheu PIX, finalize o pagamento no app do seu banco: o pedido é atualizado automaticamente assim que o pagamento for confirmado.",
  },
};

export default function CheckoutResult({ variant }) {
  const [searchParams] = useSearchParams();
  const { clear, cartReady } = useCart();
  const { user, authLoading } = useAuth();
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const clearedRef = useRef(false);

  const orderId = searchParams.get("external_reference");
  const { icon, color, title, description } = VARIANTS[variant];
  const Icon = status === "paid" ? ShieldCheck : icon;
  const needsLogin = !authLoading && (!user || error?.status === 401);
  const loginUrl = `/login?next=${encodeURIComponent(`/checkout/${variant}?${searchParams.toString()}`)}`;

  useEffect(() => {
    setStatus(null);
    setError(null);
    clearedRef.current = false;
    if (!orderId || authLoading || !user || !cartReady) return undefined;

    let active = true;

    const poll = () => {
      getOrderPaymentStatusRequest(orderId)
        .then(response => {
          if (!active) return;
          if (typeof response.orderStatus !== "string") {
            throw new Error("A API retornou uma resposta inválida ao consultar o pedido.");
          }
          setError(null);
          setStatus(response.orderStatus);
          if (response.orderStatus === "paid" && !clearedRef.current) {
            clearedRef.current = true;
            clear();
          }
        })
        .catch(error => {
          if (active) setError(error);
        });
    };

    poll();
    window.addEventListener("focus", poll);
    const interval = setInterval(poll, 4000);

    return () => {
      active = false;
      window.removeEventListener("focus", poll);
      clearInterval(interval);
    };
  }, [orderId, clear, authLoading, user?.id, cartReady]);

  const problem = !orderId
    ? "O link não contém o número do pedido. Acesse Meus pedidos para acompanhar sua compra."
    : needsLogin
      ? "Entre na mesma conta usada na compra para consultar a confirmação do pagamento."
      : error?.message;

  return (
    <main className="container-dts py-16">
      <div className="card mx-auto max-w-lg p-10 text-center">
        <Icon className={`mx-auto ${color}`} size={48} />
        <h1 className="mt-5 text-2xl font-black">{problem ? "Não foi possível consultar o pedido" : status === "paid" ? "Pagamento confirmado" : status === "cancelled" ? "Pedido cancelado" : !status ? "Consultando pagamento…" : title}</h1>
        <p role={problem ? "alert" : "status"} className="mx-auto mt-2 max-w-md text-slate-500">{problem || (status === "paid" ? "Seu pagamento foi confirmado. Acompanhe a compra em Meus pedidos." : status === "cancelled" ? "Este pedido foi cancelado. Você pode iniciar uma nova compra." : description)}</p>
        {status && (
          <p className="mt-3 text-sm font-semibold text-slate-600">Status atual do pedido: {status}</p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {needsLogin && <Link to={loginUrl} className="btn-primary">Entrar na minha conta</Link>}
          <Link to="/account/orders" className="btn-primary">Ver meus pedidos</Link>
          <Link to="/search" className="btn-secondary">Continuar comprando</Link>
        </div>
      </div>
    </main>
  );
}
