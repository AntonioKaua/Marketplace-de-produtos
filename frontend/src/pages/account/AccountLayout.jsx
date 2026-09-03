import { NavLink, Outlet } from "react-router-dom";
import { Heart, MessageCircle, Package, User } from "lucide-react";

const LINKS = [
  { to: "/account/profile", label: "Perfil", icon: User },
  { to: "/account/orders", label: "Meus pedidos", icon: Package },
  { to: "/account/favorites", label: "Favoritos", icon: Heart },
  { to: "/account/messages", label: "Mensagens", icon: MessageCircle },
];

export default function AccountLayout() {
  return (
    <main className="container-dts py-10">
      <h1 className="text-3xl font-black">Minha conta</h1>
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
