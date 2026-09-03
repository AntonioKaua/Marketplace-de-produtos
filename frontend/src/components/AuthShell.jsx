import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="min-h-[calc(100vh-132px)] bg-slate-50 py-12">
      <div className="mx-auto max-w-md px-4">
        <div className="mb-7 text-center">
          <Link to="/" className="text-3xl font-black text-dts-600">DTS</Link>
          <h1 className="mt-6 text-2xl font-black">{title}</h1>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="card p-6 sm:p-8">{children}</div>
      </div>
    </main>
  );
}
