import { NavLink, Outlet } from "react-router-dom";
import { Layers, Store, Users } from "lucide-react";

const LINKS = [
  { to: "/admin/users", label: "Usuários", icon: Users },
  { to: "/admin/products", label: "Produtos", icon: Store },
  { to: "/admin/categories", label: "Categorias", icon: Layers },
];

export default function AdminLayout() {
  return (
    <main className="container-dts py-10">
      <p className="font-semibold text-dts-600">Administração</p>
      <h1 className="text-3xl font-black">Painel administrativo</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="card flex h-fit flex-row gap-1 overflow-x-auto p-2 lg:flex-col">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                  isActive ? "bg-dts-600 text-white" : "text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </div>
    </main>
  );
}
