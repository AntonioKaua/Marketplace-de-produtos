import { Router } from "express";

import {
  deleteFavorite,
  getFavoriteStatus,
  getFavorites,
  postFavorite,
} from "../controllers/favorite.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getFavorites);
router.get("/:productId", getFavoriteStatus);
router.post("/:productId", postFavorite);
router.delete("/:productId", deleteFavorite);

export default router;
