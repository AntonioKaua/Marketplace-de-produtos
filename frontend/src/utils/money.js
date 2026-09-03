export const money = value =>
  Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
