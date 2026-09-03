import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { registerUserRequest } from "../services/api";
import { onlyDigits, validateRegistrationForm } from "../utils/userValidation";

export default function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const change = event => {
    const { name } = event.target;
    const value = ["phone", "cpf"].includes(name)
      ? onlyDigits(event.target.value).slice(0, 11)
      : event.target.value;

    setData(current => ({ ...current, [name]: value }));
    setFieldErrors(current => ({ ...current, [name]: undefined }));
    setError("");
  };

  const submit = async event => {
    event.preventDefault();
    setError("");

    const validationErrors = validateRegistrationForm(data);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setError("Corrija os campos destacados antes de continuar.");
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await registerUserRequest({
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        password: data.password,
      });

      await login(data.email, data.password);
      navigate("/account/profile", { replace: true });
    } catch (requestError) {
      setFieldErrors(requestError.errors || {});
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = field => `input ${fieldErrors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`;

  return (
    <AuthShell title="Crie sua conta" subtitle="Cadastre-se para comprar e vender na DTS.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Nome" error={fieldErrors.name}><input className={inputClass("name")} name="name" autoComplete="name" maxLength={100} value={data.name} onChange={change} aria-invalid={Boolean(fieldErrors.name)} disabled={loading} /></Field>
        <Field label="E-mail" error={fieldErrors.email}><input className={inputClass("email")} name="email" type="email" autoComplete="email" maxLength={254} value={data.email} onChange={change} aria-invalid={Boolean(fieldErrors.email)} disabled={loading} /></Field>
        <Field label="Telefone" error={fieldErrors.phone}><input className={inputClass("phone")} name="phone" inputMode="numeric" autoComplete="tel" maxLength={11} value={data.phone} onChange={change} aria-invalid={Boolean(fieldErrors.phone)} placeholder="85999999999" disabled={loading} /></Field>
        <Field label="CPF" error={fieldErrors.cpf}><input className={inputClass("cpf")} name="cpf" inputMode="numeric" maxLength={11} value={data.cpf} onChange={change} aria-invalid={Boolean(fieldErrors.cpf)} placeholder="Somente números" disabled={loading} /></Field>
        <Field label="Senha" error={fieldErrors.password}><input className={inputClass("password")} name="password" type="password" autoComplete="new-password" maxLength={72} value={data.password} onChange={change} aria-invalid={Boolean(fieldErrors.password)} disabled={loading} /></Field>
        <Field label="Confirmar senha" error={fieldErrors.confirm}><input className={inputClass("confirm")} name="confirm" type="password" autoComplete="new-password" maxLength={72} value={data.confirm} onChange={change} aria-invalid={Boolean(fieldErrors.confirm)} disabled={loading} /></Field>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Criando conta..." : "Criar minha conta"}</button>
        <p className="text-center text-sm text-slate-500">Já possui conta? <Link className="font-bold text-dts-600" to="/login">Entrar</Link></p>
      </form>
    </AuthShell>
  );
}
