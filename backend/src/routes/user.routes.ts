import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", requireAuth, getCurrentUser);
router.patch("/me", requireAuth, updateProfile);
router.post("/", registerUser);

export default router;
