import { LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <main className="container-dts py-16">
      <div className="card p-10 text-center">
        <LayoutDashboard className="mx-auto text-dts-600" size={42} />
        <h1 className="mt-5 text-2xl font-black">Página não encontrada</h1>
        <p className="mx-auto mt-2 max-w-lg text-slate-500">O endereço acessado não existe ou foi movido.</p>
      </div>
    </main>
  );
}
