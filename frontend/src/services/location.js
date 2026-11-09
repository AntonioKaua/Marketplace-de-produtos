export async function lookupCep(cep, { signal } = {}) {
  if (!/^\d{8}$/.test(cep)) throw new Error("Informe um CEP com 8 dígitos.");
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal });
  if (!response.ok) throw new Error("Consulta de CEP indisponível. Preencha o endereço manualmente.");
  const data = await response.json();
  if (data.erro) throw new Error("CEP não encontrado. Confira o CEP ou preencha o endereço manualmente.");
  if (!data.localidade || !data.uf) throw new Error("Endereço incompleto. Preencha os campos manualmente.");
  return {
    address: [data.logradouro, data.bairro].filter(Boolean).join(", "),
    city: data.localidade,
    state: data.uf,
  };
}
