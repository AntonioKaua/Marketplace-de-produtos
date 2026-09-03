import AuthShell from "../components/AuthShell";
import Field from "../components/Field";

export default function ForgotPassword() {
  return (
    <AuthShell title="Recuperar senha" subtitle="Informe seu e-mail para receber as instruções.">
      <form className="space-y-5" onSubmit={e => e.preventDefault()}>
        <Field label="E-mail"><input className="input" type="email" placeholder="seu@email.com" /></Field>
        <button className="btn-primary w-full" type="submit">Enviar instruções</button>
      </form>
    </AuthShell>
  );
}
