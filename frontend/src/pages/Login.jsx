import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async event => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);

      const requestedPath = new URLSearchParams(location.search).get("next");
      const destination = requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/account/profile";

      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Entre na sua conta" subtitle="Acesse seus pedidos, favoritos e compras.">
      <form onSubmit={submit} className="space-y-5">
        <Field label="E-mail"><input className="input" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" disabled={loading} /></Field>
        <Field label="Senha"><input className="input" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" disabled={loading} /></Field>
        {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
        <div className="text-right"><Link to="/forgot-password" className="text-sm font-semibold text-dts-600">Esqueceu sua senha?</Link></div>
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        <p className="text-center text-sm text-slate-500">Ainda não possui conta? <Link className="font-bold text-dts-600" to="/register">Criar conta</Link></p>
      </form>
    </AuthShell>
  );
}
