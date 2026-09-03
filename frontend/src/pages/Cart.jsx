import { Link } from "react-router-dom";
import { ImageOff, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { money } from "../utils/money";

export default function Cart() {
  const { cart, remove, setQty, total } = useCart();

  return (
    <main className="container-dts py-10">
      <h1 className="text-3xl font-black">Seu carrinho</h1>
      {!cart.length ? (
        <div className="card mt-8 p-10 text-center">
          <ShoppingCart className="mx-auto text-slate-300" size={48} />
          <h2 className="mt-4 text-xl font-bold">Seu carrinho está vazio</h2>
          <Link className="btn-primary mt-5" to="/search">Continuar comprando</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="card flex gap-4 p-4">
                {item.image ? (
                  <img src={item.image} className="h-24 w-24 rounded-xl object-cover" alt="" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-slate-100 text-slate-300"><ImageOff size={28} /></div>
                )}
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${item.id}`} className="font-bold hover:text-dts-600">{item.title}</Link>
                  <p className="mt-1 text-sm text-slate-500">{item.sellerName}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button onClick={() => setQty(item.id, item.qty - 1)} className="rounded-lg border px-3 py-1">−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => setQty(item.id, item.qty + 1)} className="rounded-lg border px-3 py-1">+</button>
                  </div>
                </div>
                <div className="text-right">
                  <b>{money(item.price * item.qty)}</b>
                  <button onClick={() => remove(item.id)} className="mt-3 block text-sm font-semibold text-red-600">Remover</button>
                </div>
              </div>
            ))}
          </div>
          <div className="card h-fit p-6">
            <h2 className="text-lg font-black">Resumo</h2>
            <div className="mt-5 flex justify-between text-slate-500"><span>Subtotal</span><span>{money(total)}</span></div>
            <div className="mt-3 flex justify-between text-slate-500"><span>Frete</span><span>Combinado com o vendedor</span></div>
            <div className="my-5 border-t pt-5 flex justify-between text-xl font-black"><span>Total</span><span>{money(total)}</span></div>
            <Link to="/checkout" className="btn-primary w-full">Continuar compra</Link>
          </div>
        </div>
      )}
    </main>
  );
}
