import app from "./app.js";
import supportRoutes from "./routes/support.routes.js";

const PORT = process.env.PORT || 3000;

// Registra as rotas antes de iniciar o servidor
app.use("/support", supportRoutes);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
