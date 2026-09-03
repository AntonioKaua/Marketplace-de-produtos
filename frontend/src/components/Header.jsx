import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { listCategoriesRequest } from "../services/categories";

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    listCategoriesRequest()
      .then(response => setCategories(response.categories.filter(category => !category.parentId)))
      .catch(error => console.error("Erro ao carregar categorias:", error));
  }, []);

  const search = e => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="container-dts flex h-20 items-center gap-4">
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
        <Link to="/" className="shrink-0">
          <div className="text-2xl font-black tracking-tight text-dts-600">DTS</div>
          <div className="-mt-1 hidden text-[9px] font-bold uppercase tracking-[.22em] text-slate-500 sm:block">Digital Trading & Selling</div>
        </Link>

        <form onSubmit={search} className="hidden flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
            <input value={q} onChange={e => setQ(e.target.value)} className="input pl-11" placeholder="O que você está procurando?" />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-2">
          <Link to="/seller" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 lg:block">Vender na DTS</Link>
          {user ? (
            <div className="group relative hidden sm:block">
              <button className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-100">
                <User size={20} /><span className="max-w-24 truncate text-sm font-semibold">{user.name}</span>
              </button>
              <div className="invisible absolute right-0 top-full z-50 w-56 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                <div className="rounded-2xl border bg-white p-2 shadow-xl">
                  <Link className="flex gap-2 rounded-xl px-3 py-2 hover:bg-slate-50" to="/account/profile">Minha conta</Link>
                  <Link className="flex gap-2 rounded-xl px-3 py-2 hover:bg-slate-50" to="/account/orders">Meus pedidos</Link>
                  <Link className="flex gap-2 rounded-xl px-3 py-2 hover:bg-slate-50" to="/account/favorites">Favoritos</Link>
                  <Link className="flex gap-2 rounded-xl px-3 py-2 hover:bg-slate-50" to="/account/messages">Mensagens</Link>
                  {user.role === "admin" && (
                    <Link className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-dts-600 hover:bg-slate-50" to="/admin">
                      <ShieldCheck size={16} /> Painel admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex w-full gap-2 rounded-xl px-3 py-2 text-left text-red-600 hover:bg-red-50"><LogOut size={18} />Sair</button>
                </div>
              </div>
            </div>
          ) : <Link to="/login" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-slate-100 sm:flex"><User size={20} />Entrar</Link>}
          <Link to="/cart" className="relative rounded-xl p-2 hover:bg-slate-100">
            <ShoppingCart />
            {count > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-dts-600 px-1 text-xs font-bold text-white">{count}</span>}
          </Link>
        </nav>
      </div>

      <div className="border-t border-slate-100 md:hidden">
        <form onSubmit={search} className="container-dts py-3">
          <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={q} onChange={e => setQ(e.target.value)} className="input pl-11" placeholder="Buscar produtos..." /></div>
        </form>
      </div>

      {open && (
        <div className="border-t bg-white p-4 lg:hidden">
          <div className="container-dts flex flex-col gap-2">
            <Link onClick={() => setOpen(false)} to="/seller" className="rounded-xl p-3 hover:bg-slate-50">Vender na DTS</Link>
            {user ? (
              <>
                <Link onClick={() => setOpen(false)} to="/account/profile" className="rounded-xl p-3 hover:bg-slate-50">Minha conta</Link>
                <Link onClick={() => setOpen(false)} to="/account/messages" className="rounded-xl p-3 hover:bg-slate-50">Mensagens</Link>
                {user.role === "admin" && <Link onClick={() => setOpen(false)} to="/admin" className="rounded-xl p-3 font-semibold text-dts-600 hover:bg-slate-50">Painel admin</Link>}
                <button onClick={handleLogout} className="rounded-xl p-3 text-left text-red-600 hover:bg-red-50">Sair</button>
              </>
            ) : <Link onClick={() => setOpen(false)} to="/login" className="rounded-xl p-3 hover:bg-slate-50">Entrar / Criar conta</Link>}
          </div>
        </div>
      )}

      <div className="hidden border-t border-slate-100 md:block">
        <div className="container-dts flex h-11 items-center gap-7 text-sm font-medium text-slate-600">
          {categories.map(category => (
            <Link key={category.id} to={`/categories/${category.id}`} className="hover:text-dts-600">{category.name}</Link>
          ))}
          <Link to="/search" className="font-bold text-dts-600">Ver todos</Link>
        </div>
      </div>
    </header>
  );
}
