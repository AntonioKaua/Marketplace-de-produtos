import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Package, Store } from "lucide-react";

const LINKS = [
  { to: "/seller", label: "Painel", icon: LayoutDashboard, end: true },
  { to: "/seller/products", label: "Meus produtos", icon: Store },
  { to: "/seller/orders", label: "Pedidos recebidos", icon: Package },
];

export default function SellerLayout() {
  return (
    <main className="container-dts py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-semibold text-dts-600">Área do vendedor</p>
          <h1 className="text-3xl font-black">Vender na DTS</h1>
        </div>
        <NavLink to="/seller/products/new" className="btn-primary">+ Novo produto</NavLink>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="card flex h-fit flex-row gap-1 overflow-x-auto p-2 lg:flex-col">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
