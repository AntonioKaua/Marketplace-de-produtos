import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Store } from "lucide-react";
import { getMyProductsRequest } from "../../services/products";
import { listSellingOrdersRequest } from "../../services/orders";
import { money } from "../../utils/money";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    getMyProductsRequest().then(response => setProducts(response.products)).catch(() => {});
    listSellingOrdersRequest().then(response => setSales(response.orders)).catch(() => {});
  }, []);

  const paidSales = sales.filter(sale => sale.status === "paid" || sale.status === "shipped");
  const revenue = paidSales.reduce((sum, sale) => sum + sale.item.unitPrice * sale.item.quantity, 0);
  const distinctOrders = new Set(sales.map(sale => sale.orderId)).size;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Vendas confirmadas", money(revenue)],
          ["Pedidos", String(distinctOrders)],
          ["Produtos anunciados", String(products.length)],
          ["Itens vendidos", String(paidSales.reduce((sum, sale) => sum + sale.item.quantity, 0))],
        ].map(([label, value]) => (
          <div className="card p-5" key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-black">Acesso rápido</h2>
          <div className="mt-4 grid gap-3">
            <Link className="btn-secondary justify-start" to="/seller/products"><Store size={18} /> Meus produtos</Link>
            <Link className="btn-secondary justify-start" to="/seller/orders"><Package size={18} /> Pedidos recebidos</Link>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-black">Últimas vendas</h2>
          <div className="mt-4 space-y-3">
            {sales.length === 0 && <p className="text-sm text-slate-500">Nenhuma venda ainda.</p>}
            {sales.slice(0, 5).map((sale, index) => (
              <div key={index} className="flex justify-between border-b pb-3 text-sm last:border-none">
                <span>#{sale.orderId} — {sale.item.title}</span>
                <b>{money(sale.item.unitPrice * sale.item.quantity)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
