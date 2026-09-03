import { Router } from "express";

import { getOrderPaymentStatus, postWebhook } from "../controllers/payment.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/webhook", postWebhook);
router.get("/order/:orderId", requireAuth, getOrderPaymentStatus);

export default router;
