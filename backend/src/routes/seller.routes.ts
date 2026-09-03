import { Router } from "express";

import { listReviewsHandler, postReviewHandler } from "../controllers/review.controller.js";
import { getSeller } from "../controllers/seller.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/:id", getSeller);
router.get("/:id/reviews", listReviewsHandler("seller"));
router.post("/:id/reviews", requireAuth, postReviewHandler("seller"));

export default router;
