import { Router } from "express";

import {
  getMyOrders,
  getOrder,
  getSellingOrders,
  postOrder,
  postOrderCheckout,
} from "../controllers/order.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/mine", getMyOrders);
router.get("/selling", getSellingOrders);
router.get("/:id", getOrder);
router.post("/", postOrder);
router.post("/:id/checkout", postOrderCheckout);

export default router;
