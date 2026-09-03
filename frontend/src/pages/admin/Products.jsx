import { useEffect, useState } from "react";
import { deleteAdminProductRequest, listAdminProductsRequest } from "../../services/admin";
import { money } from "../../utils/money";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAdminProductsRequest()
      .then(response => setProducts(response.products))
      .catch(error => console.error("Erro ao listar produtos:", error))
      .finally(() => setLoading(false));
  }, []);

  const remove = async id => {
    if (!window.confirm("Remover este produto do catálogo?")) return;
    await deleteAdminProductRequest(id).catch(error => console.error("Erro ao remover produto:", error));
    setProducts(current => current.filter(product => product.id !== id));
  };

  if (loading) return <div className="card p-6 text-slate-500">Carregando produtos...</div>;

  return (
    <div className="card overflow-x-auto p-4">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead>
          <tr className="border-b text-slate-500">
            <th className="p-3">Produto</th>
            <th className="p-3">Vendedor</th>
            <th className="p-3">Preço</th>
            <th className="p-3">Status</th>
            <th className="p-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} className="border-b last:border-none">
              <td className="p-3 font-semibold">{product.title}</td>
              <td className="p-3 text-slate-500">{product.seller?.name}</td>
              <td className="p-3">{money(product.price)}</td>
              <td className="p-3">{product.status}</td>
              <td className="p-3"><button onClick={() => remove(product.id)} className="font-semibold text-red-600">Remover</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
