import { Router } from "express";

import {
  getMyOrders,
  getOrder,
  getSellingOrders,
  postOrder,
  postOrderCheckout,
} from "../controllers/order.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

// Todos os pedidos pertencem a um usuário autenticado.
const router = Router();

// Aplica a proteção uma vez para todas as rotas declaradas abaixo.
router.use(requireAuth);
router.get("/mine", getMyOrders);
router.get("/selling", getSellingOrders);
router.get("/:id", getOrder);
router.post("/", postOrder);
router.post("/:id/checkout", postOrderCheckout);

export default router;
