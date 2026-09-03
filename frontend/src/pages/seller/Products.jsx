import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { deleteProductRequest, getMyProductsRequest } from "../../services/products";
import { money } from "../../utils/money";

const STATUS_LABELS = { active: "Ativo", sold: "Vendido", inactive: "Inativo" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getMyProductsRequest()
      .then(response => setProducts(response.products))
      .catch(error => console.error("Erro ao listar produtos:", error))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async id => {
    if (!window.confirm("Remover este produto? Esta ação não pode ser desfeita.")) return;
    await deleteProductRequest(id).catch(error => console.error("Erro ao remover produto:", error));
    setProducts(current => current.filter(product => product.id !== id));
  };

  if (loading) return <div className="card p-6 text-slate-500">Carregando produtos...</div>;
  if (products.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-slate-500">Você ainda não anunciou nenhum produto.</p>
        <Link to="/seller/products/new" className="btn-primary mt-5 inline-flex">Anunciar produto</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {products.map(product => (
        <div key={product.id} className="card flex flex-wrap items-center gap-4 p-4">
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} className="h-16 w-16 rounded-xl object-cover" alt="" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-300"><ImageOff size={20} /></div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold">{product.title}</p>
            <p className="text-sm text-slate-500">{money(product.price)} • {product.quantity} em estoque • {STATUS_LABELS[product.status] ?? product.status}</p>
          </div>
          <Link to={`/seller/products/${product.id}/edit`} className="btn-secondary py-2 text-sm">Editar</Link>
          <button onClick={() => remove(product.id)} className="text-sm font-semibold text-red-600">Remover</button>
        </div>
      ))}
    </div>
  );
}
