import { Router } from "express";

import {
  getTicket,
  getTicketMessages,
  getTickets,
  postTicket,
  postTicketMessage,
} from "../controllers/support.controller.js";

import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({
        message: "Central de atendimento funcionando!"
    });
});

router.use(requireAuth);

router.post("/tickets", postTicket);

router.get("/tickets", getTickets);

router.get("/tickets/:id", getTicket);

router.get("/tickets/:id/messages", getTicketMessages);

router.post("/tickets/:id/messages", postTicketMessage);

export default router;
