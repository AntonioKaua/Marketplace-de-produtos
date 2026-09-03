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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "API funcionando!",
  });
});

app.use("/users", userRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/sellers", sellerRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/orders", orderRoutes);
app.use("/payments", paymentRoutes);
app.use("/conversations", conversationRoutes);
app.use("/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
