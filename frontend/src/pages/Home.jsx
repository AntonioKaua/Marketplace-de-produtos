import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, CreditCard, ShieldCheck, Truck } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { listCategoriesRequest } from "../services/categories";
import { listProductsRequest } from "../services/products";

const CATEGORY_ICONS = {
  "Eletrônicos": "📱",
  "Informática": "💻",
  "Casa": "🏠",
  "Moda": "👟",
  "Automóveis": "🚗",
  "Outros": "📦",
};

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listCategoriesRequest().catch(() => ({ categories: [] })),
      listProductsRequest({ limit: 6 }).catch(() => ({ products: [] })),
    ]).then(([categoryResponse, productResponse]) => {
      setCategories(categoryResponse.categories.filter(category => !category.parentId));
      setProducts(productResponse.products);
      setLoading(false);
    });
  }, []);

  const featured = products[0];

  return (
    <main>
      <section className="bg-gradient-to-br from-dts-900 via-dts-700 to-dts-600 text-white">
        <div className="container-dts grid min-h-[430px] items-center gap-10 py-14 md:grid-cols-2">
          <div>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">DTS Marketplace</span>
            <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">Encontre. Compre. Venda.</h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-blue-100">Uma nova experiência para comprar e vender produtos na Digital Trading & Selling.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/search" className="btn-primary bg-white text-dts-700 hover:bg-blue-50">Comprar agora <ArrowRight className="ml-2" size={18} /></Link>
              <Link to="/seller" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">Quero vender</Link>
            </div>
          </div>
          {featured && (
            <div className="hidden md:block">
              <Link to={`/products/${featured.id}`} className="mx-auto block max-w-md rounded-[2rem] bg-white/10 p-4 backdrop-blur">
                {featured.images?.[0]?.url && (
                  <img src={featured.images[0].url} alt={featured.title} className="h-72 w-full rounded-3xl object-cover" />
                )}
                <div className="p-4">
                  <div className="text-sm text-blue-100">Oferta em destaque</div>
                  <div className="mt-1 text-xl font-bold">{featured.title}</div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-dts -mt-8 relative z-10">
          <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-white p-4 shadow-lg sm:grid-cols-3 lg:grid-cols-6">
            {categories.map(category => (
              <Link key={category.id} to={`/categories/${category.id}`} className="flex flex-col items-center gap-2 rounded-xl p-3 text-center hover:bg-slate-50">
                <span className="text-3xl">{CATEGORY_ICONS[category.name] ?? "🏷️"}</span>
                <span className="text-sm font-semibold">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-dts pt-14">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-semibold text-dts-600">Seleção DTS</p>
            <h2 className="text-3xl font-black">Anúncios recentes</h2>
          </div>
          <Link to="/search" className="hidden items-center gap-1 font-semibold text-dts-600 sm:flex">Ver todos <ChevronRight size={18} /></Link>
        </div>

        {loading ? (
          <p className="mt-8 text-slate-500">Carregando produtos...</p>
        ) : products.length === 0 ? (
          <p className="mt-8 text-slate-500">Nenhum produto anunciado ainda. Seja o primeiro a vender!</p>
        ) : (
          <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>

      <section className="container-dts py-16">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="card p-6"><Truck className="text-dts-600" /><h3 className="mt-4 font-bold">Entrega</h3><p className="mt-2 text-sm text-slate-500">Combine a entrega diretamente com o vendedor pelo chat.</p></div>
          <div className="card p-6"><ShieldCheck className="text-dts-600" /><h3 className="mt-4 font-bold">Compra segura</h3><p className="mt-2 text-sm text-slate-500">Avaliações de produtos e vendedores para comprar com confiança.</p></div>
          <div className="card p-6"><CreditCard className="text-dts-600" /><h3 className="mt-4 font-bold">Pagamento</h3><p className="mt-2 text-sm text-slate-500">Checkout integrado com o Mercado Pago.</p></div>
        </div>
      </section>
    </main>
  );
}
