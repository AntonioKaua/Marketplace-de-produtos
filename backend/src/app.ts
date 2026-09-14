// Carrega as variáveis do arquivo .env antes de inicializar dependências da API.
import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import adminRoutes from "./routes/admin.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import productRoutes from "./routes/product.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import userRoutes from "./routes/user.routes.js";

// A aplicação é exportada sem chamar listen(). Assim, ela pode ser usada tanto
// pelo servidor local quanto pela função serverless da Vercel.
const app = express();

// Converte JSON recebido no corpo das requisições e lê cookies de sessão.
app.use(express.json());
app.use(cookieParser());

// Rota simples para confirmar que a API está online.
app.get("/", (_req, res) => {
  res.json({ message: "API funcionando!" });
});

// Cada grupo de rotas recebe um prefixo para organizar a API.
app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/sellers", sellerRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use("/conversations", conversationRoutes);
app.use("/admin", adminRoutes);

export default app;
