import { useEffect, useState } from "react";
import { listMyOrdersRequest, retryOrderCheckoutRequest } from "../../services/orders";
import { money } from "../../utils/money";

const STATUS_LABELS = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  shipped: "Enviado",
  cancelled: "Cancelado",
};

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  shipped: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);

  useEffect(() => {
    listMyOrdersRequest()
      .then(response => setOrders(response.orders))
      .catch(error => console.error("Erro ao listar pedidos:", error))
      .finally(() => setLoading(false));
  }, []);

  const retry = async orderId => {
    setRetryingId(orderId);
    try {
      const response = await retryOrderCheckoutRequest(orderId);
      window.location.href = response.initPoint;
    } catch (error) {
      console.error("Erro ao gerar novo link de pagamento:", error);
      setRetryingId(null);
    }
  };

  if (loading) return <div className="card p-6 text-slate-500">Carregando pedidos...</div>;
  if (orders.length === 0) return <div className="card p-6 text-slate-500">Você ainda não fez nenhum pedido.</div>;

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <div key={order.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="font-bold">Pedido #{order.id}</p>
            <p className="text-sm text-slate-500">{new Date(order.creationDate).toLocaleString("pt-BR")}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLORS[order.status] ?? "bg-slate-100 text-slate-600"}`}>
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
            <b>{money(order.total)}</b>
            {order.status === "pending" && (
              <button onClick={() => retry(order.id)} disabled={retryingId === order.id} className="btn-secondary py-2 text-sm">
                {retryingId === order.id ? "Gerando..." : "Pagar agora"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
