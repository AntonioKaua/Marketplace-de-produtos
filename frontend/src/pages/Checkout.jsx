import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { createOrderRequest } from "../services/orders";
import { money } from "../utils/money";
import { lookupCep } from "../services/location";

const UF_LIST = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export default function Checkout() {
  const { user } = useAuth();
  const { cart, total } = useCart();
  const [shipping, setShipping] = useState({ cep: "", address: "", city: "", state: "" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepMessage, setCepMessage] = useState("");

  useEffect(() => {
    if (shipping.cep.length !== 8) return;
    const controller = new AbortController();
    let active = true;
    setCepLoading(true);
    setCepMessage("Buscando endereço...");
    const timeout = setTimeout(() => controller.abort(), 8000);
    lookupCep(shipping.cep, { signal: controller.signal })
      .then(address => {
        if (!active) return;
        setShipping(current => ({ ...current, ...address }));
        setErrors(current => ({ ...current, address: undefined, city: undefined, state: undefined }));
        setCepMessage("Endereço preenchido. Acrescente o número e o complemento no campo Endereço.");
      })
      .catch(error => {
        if (active) setCepMessage(error instanceof TypeError || error.name === "AbortError"
          ? "Não foi possível consultar o CEP. Preencha o endereço manualmente."
          : error.message);
      })
      .finally(() => {
        clearTimeout(timeout);
        if (active) setCepLoading(false);
      });
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [shipping.cep]);

  if (!user) return <Navigate to="/login?next=/checkout" replace />;
  if (cart.length === 0) return <Navigate to="/cart" replace />;

  const change = event => {
    const { name, value } = event.target;
    if (name === "cep") {
      setCepMessage("");
      setCepLoading(false);
      setShipping(current => ({ ...current, cep: value.replace(/\D/g, "").slice(0, 8), address: "", city: "", state: "" }));
      setErrors(current => ({ ...current, cep: undefined }));
      return;
    }
    setShipping(current => ({ ...current, [name]: name === "cep" ? value.replace(/\D/g, "").slice(0, 8) : value }));
    setErrors(current => ({ ...current, [name]: undefined }));
  };

  const submit = async event => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);
      const response = await createOrderRequest({
        items: cart.map(item => ({ productId: item.id, quantity: item.qty })),
        shipping,
      });

      window.location.href = response.initPoint;
    } catch (requestError) {
      setErrors(requestError.errors || {});
      setError(requestError.message);
      setLoading(false);
    }
  };

  return (
    <main className="container-dts py-10">
      <h1 className="text-3xl font-black">Checkout</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="space-y-5">
          <div className="card p-6">
            <h2 className="font-black">1. Endereço de entrega</h2>
            <p role="status" aria-live="polite" className="mt-3 text-sm text-slate-500">{cepMessage}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="CEP" error={errors.cep}><input className="input" name="cep" inputMode="numeric" maxLength={8} value={shipping.cep} onChange={change} placeholder="00000000" /></Field>
              <Field label="Cidade" error={errors.city}><input className="input" name="city" disabled={cepLoading} value={shipping.city} onChange={change} /></Field>
              <Field label="Endereço" error={errors.address}><input className="input" name="address" disabled={cepLoading} value={shipping.address} onChange={change} placeholder="Rua, número, bairro" /></Field>
              <Field label="Estado" error={errors.state}>
                <select className="input" name="state" disabled={cepLoading} value={shipping.state} onChange={change}>
                  <option value="">Selecione</option>
                  {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </Field>
            </div>
          </div>
          <div className="card p-6">
            <h2 className="font-black">2. Pagamento</h2>
            <div className="mt-4 rounded-xl border border-dashed p-5 text-sm text-slate-500">Você será redirecionado para o Mercado Pago para concluir o pagamento com segurança.</div>
            {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
            <button className="btn-primary mt-5 w-full" disabled={loading || cepLoading}>{loading ? "Gerando pagamento..." : "Continuar para pagamento"}</button>
          </div>
        </form>
        <div className="card h-fit p-6">
          <h2 className="font-black">Resumo da compra</h2>
          <div className="mt-4 space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm text-slate-600">
                <span>{item.qty}x {item.title}</span>
                <span>{money(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="my-4 border-t pt-4 flex justify-between text-lg font-black"><span>Total</span><span>{money(total)}</span></div>
        </div>
      </div>
    </main>
  );
}
