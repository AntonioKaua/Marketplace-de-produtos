import app from "./app.js";

// Este arquivo é usado apenas no desenvolvimento local. Na Vercel, api/index.ts
// exporta a mesma aplicação sem abrir uma porta manualmente.
const PORT = process.env.PORT || 3000;

// Inicia o servidor depois que toda a configuração e as rotas foram registradas.
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
