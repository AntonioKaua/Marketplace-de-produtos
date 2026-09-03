import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t bg-white">
      <div className="container-dts grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="text-2xl font-black text-dts-600">DTS</div>
          <p className="mt-3 text-sm leading-6 text-slate-500">Digital Trading & Selling. Um marketplace para comprar e vender de forma simples.</p>
        </div>
        <div>
          <h3 className="font-bold">Comprar</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-500">
            <Link className="block hover:text-dts-600" to="/search">Produtos</Link>
            <Link className="block hover:text-dts-600" to="/cart">Carrinho</Link>
            <Link className="block hover:text-dts-600" to="/account/orders">Pedidos</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Vender</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-500">
            <Link className="block hover:text-dts-600" to="/seller">Vender na DTS</Link>
            <Link className="block hover:text-dts-600" to="/seller/products">Meus produtos</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Atendimento</h3>
          <p className="mt-3 text-sm text-slate-500">Central de ajuda e suporte DTS.</p>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} DTS — Digital Trading & Selling.</div>
    </footer>
  );
}
