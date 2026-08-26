import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
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

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
