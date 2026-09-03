import { Router } from "express";

import {
  getAdminProducts,
  getUsers,
  patchUserRole,
  removeAdminProduct,
  removeUser,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);
router.get("/users", getUsers);
router.patch("/users/:id/role", patchUserRole);
router.delete("/users/:id", removeUser);
router.get("/products", getAdminProducts);
router.delete("/products/:id", removeAdminProduct);

export default router;
