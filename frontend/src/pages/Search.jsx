import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { listCategoriesRequest } from "../services/categories";
import { listProductsRequest } from "../services/products";

export default function Search() {
  const { categoryId: categoryIdFromPath } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get("q") ?? "";
  const categoryId = categoryIdFromPath ?? searchParams.get("categoryId") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  useEffect(() => {
    listCategoriesRequest().then(response => setCategories(response.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    listProductsRequest({ q, categoryId, minPrice, maxPrice, limit: 24 })
      .then(response => {
        setProducts(response.products);
        setTotal(response.total);
      })
      .catch(error => console.error("Erro ao buscar produtos:", error))
      .finally(() => setLoading(false));
  }, [q, categoryId, minPrice, maxPrice]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const categoryName = categories.find(category => String(category.id) === String(categoryId))?.name;

  return (
    <main className="container-dts py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-400">DTS / {categoryName ?? "Busca"}</p>
          <h1 className="mt-1 text-3xl font-black">{categoryName ?? "Produtos"}</h1>
        </div>
        <input
          value={q}
          onChange={e => updateParam("q", e.target.value)}
          className="input max-w-md"
          placeholder="Pesquisar..."
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <select
          className="input w-auto"
          value={categoryIdFromPath ? "" : categoryId}
          disabled={Boolean(categoryIdFromPath)}
          onChange={e => updateParam("categoryId", e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input className="input w-32" type="number" min="0" placeholder="Preço mín." value={minPrice} onChange={e => updateParam("minPrice", e.target.value)} />
        <input className="input w-32" type="number" min="0" placeholder="Preço máx." value={maxPrice} onChange={e => updateParam("maxPrice", e.target.value)} />
      </div>

      <p className="mt-4 text-sm text-slate-500">{loading ? "Buscando..." : `${total} produto(s) encontrado(s).`}</p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(product => <ProductCard key={product.id} product={product} />)}
      </div>
    </main>
  );
}
