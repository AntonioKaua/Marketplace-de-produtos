import { Router } from "express";

import {
  getConversations,
  getMessages,
  postConversation,
  postMessage,
} from "../controllers/conversation.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getConversations);
router.post("/", postConversation);
router.get("/:id/messages", getMessages);
router.post("/:id/messages", postMessage);

export default router;
