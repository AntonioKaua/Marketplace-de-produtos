import { Router } from "express";

import { getOrderPaymentStatus, postWebhook } from "../controllers/payment.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

// O webhook é público porque é chamado pelo Mercado Pago; a consulta exige login.
const router = Router();

router.post("/webhook", postWebhook);
router.get("/order/:orderId", requireAuth, getOrderPaymentStatus);

export default router;
