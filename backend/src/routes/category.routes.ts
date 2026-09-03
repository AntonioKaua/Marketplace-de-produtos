import { Router } from "express";

import {
  getCategories,
  postCategory,
  putCategory,
  removeCategory,
} from "../controllers/category.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", getCategories);
router.post("/", requireAuth, requireAdmin, postCategory);
router.put("/:id", requireAuth, requireAdmin, putCategory);
router.delete("/:id", requireAuth, requireAdmin, removeCategory);

export default router;
