import { useEffect, useState } from "react";
import { listSellingOrdersRequest } from "../../services/orders";
import { money } from "../../utils/money";

const STATUS_LABELS = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  shipped: "Enviado",
  cancelled: "Cancelado",
};

export default function Orders() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSellingOrdersRequest()
      .then(response => setSales(response.orders))
      .catch(error => console.error("Erro ao listar vendas:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card p-6 text-slate-500">Carregando pedidos...</div>;
  if (sales.length === 0) return <div className="card p-6 text-slate-500">Você ainda não recebeu nenhum pedido.</div>;

  return (
    <div className="space-y-3">
      {sales.map((sale, index) => (
        <div key={index} className="card flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="font-bold">Pedido #{sale.orderId} — {sale.item.title}</p>
            <p className="text-sm text-slate-500">{sale.item.quantity}x • {sale.shippingCity}/{sale.shippingState}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{STATUS_LABELS[sale.status] ?? sale.status}</span>
            <b>{money(sale.item.unitPrice * sale.item.quantity)}</b>
          </div>
        </div>
      ))}
    </div>
  );
}
