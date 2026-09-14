import { Router } from "express";
import { createChatbotIdentityToken } from "../controllers/chatbot.controller.js";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateProfile,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

// Rotas abertas: cadastro, login e logout. Rotas com requireAuth exigem sessão.
const router = Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", requireAuth, getCurrentUser);
router.get("/chatbot-token", requireAuth, createChatbotIdentityToken);
router.patch("/me", requireAuth, updateProfile);
router.post("/", registerUser);

export default router;
