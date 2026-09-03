import { useState } from "react";
import Field from "../../components/Field";
import { useAuth } from "../../context/AuthContext";
import { updateProfileRequest } from "../../services/api";
import { onlyDigits } from "../../utils/userValidation";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setMessage("");
    setErrors({});
    setLoading(true);

    try {
      const response = await updateProfileRequest({ name, phone });
      setUser(response.user);
      setMessage("Perfil atualizado com sucesso.");
    } catch (error) {
      setErrors(error.errors || {});
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="font-black">Dados pessoais</h2>
      <form onSubmit={submit} className="mt-5 max-w-md space-y-4">
        <Field label="Nome" error={errors.name}>
          <input className="input" value={name} onChange={e => setName(e.target.value)} maxLength={100} disabled={loading} />
        </Field>
        <Field label="Telefone" error={errors.phone}>
          <input className="input" value={phone} onChange={e => setPhone(onlyDigits(e.target.value).slice(0, 11))} inputMode="numeric" maxLength={11} disabled={loading} />
        </Field>
        <Field label="E-mail">
          <input className="input bg-slate-50" value={user.email} disabled />
        </Field>
        {message && <p className="text-sm font-medium text-slate-600">{message}</p>}
        <button className="btn-primary" disabled={loading}>{loading ? "Salvando..." : "Salvar alterações"}</button>
      </form>
    </div>
  );
}
