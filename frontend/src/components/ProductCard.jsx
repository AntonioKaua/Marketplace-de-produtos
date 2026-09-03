import { Link, useNavigate } from "react-router-dom";
import { Heart, ImageOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { addFavoriteRequest } from "../services/favorites";
import { money } from "../utils/money";

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { add } = useCart();
  const navigate = useNavigate();
  const image = product.images?.[0]?.url;

  const favorite = e => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?next=/products/${product.id}`);
      return;
    }
    addFavoriteRequest(product.id).catch(error => console.error("Erro ao favoritar:", error));
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-slate-100">
          {image ? (
            <img src={image} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300"><ImageOff size={40} /></div>
          )}
          <button onClick={favorite} className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-500 shadow-sm hover:text-red-500"><Heart size={18} /></button>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs font-semibold text-slate-400">{product.category?.name ?? "Sem categoria"}</p>
        <Link to={`/products/${product.id}`}><h3 className="mt-1 min-h-10 font-semibold leading-5 hover:text-dts-600">{product.title}</h3></Link>
        <p className="mt-2 text-sm text-slate-400">{product.seller?.name}</p>
        <div className="mt-2 text-xl font-black">{money(product.price)}</div>
        {product.condition === "usado" && <div className="mt-1 text-xs font-semibold text-slate-500">Usado</div>}
        <button
          onClick={() => add(product)}
          disabled={product.quantity <= 0}
          className="btn-primary mt-4 w-full py-2.5"
        >
          {product.quantity > 0 ? "Adicionar ao carrinho" : "Fora de estoque"}
        </button>
      </div>
    </div>
  );
}
