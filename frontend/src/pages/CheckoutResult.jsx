import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Clock3, ShieldAlert, ShieldCheck } from "lucide-react";
import { useCart } from "../context/CartContext";
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
    description: "Recebemos seu pedido e estamos aguardando a confirmação do pagamento.",
  },
};

export default function CheckoutResult({ variant }) {
  const [searchParams] = useSearchParams();
  const { clear } = useCart();
  const [status, setStatus] = useState(null);
  const clearedRef = useRef(false);

  const orderId = searchParams.get("external_reference");
  const { icon: Icon, color, title, description } = VARIANTS[variant];

  useEffect(() => {
    if (!orderId) return undefined;

    let active = true;

    const poll = () => {
      getOrderPaymentStatusRequest(orderId)
        .then(response => {
          if (!active) return;
          setStatus(response.orderStatus);
          if (response.orderStatus === "paid" && !clearedRef.current) {
            clearedRef.current = true;
            clear();
          }
        })
        .catch(error => console.error("Erro ao consultar status do pedido:", error));
    };

    poll();
    const interval = setInterval(poll, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [orderId, clear]);

  return (
    <main className="container-dts py-16">
      <div className="card mx-auto max-w-lg p-10 text-center">
        <Icon className={`mx-auto ${color}`} size={48} />
        <h1 className="mt-5 text-2xl font-black">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-slate-500">{description}</p>
        {status && (
          <p className="mt-3 text-sm font-semibold text-slate-600">Status atual do pedido: {status}</p>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/account/orders" className="btn-primary">Ver meus pedidos</Link>
          <Link to="/search" className="btn-secondary">Continuar comprando</Link>
        </div>
      </div>
    </main>
  );
}
