import { Router } from "express";
import multer from "multer";

import {
  getMyProducts,
  getProduct,
  getProducts,
  postProduct,
  postProductImages,
  putProduct,
  removeProduct,
  removeProductImage,
} from "../controllers/product.controller.js";
import { listReviewsHandler, postReviewHandler } from "../controllers/review.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

// Configura o upload em memória: até 8 imagens e 5 MB por arquivo.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Apenas arquivos de imagem são permitidos."));
      return;
    }
    callback(null, true);
  },
});

// Consulta de anúncios é pública; criação, edição, exclusão e imagens exigem login.
const router = Router();

router.get("/", getProducts);
router.get("/mine", requireAuth, getMyProducts);
router.get("/:id", getProduct);
router.post("/", requireAuth, postProduct);
router.put("/:id", requireAuth, putProduct);
router.delete("/:id", requireAuth, removeProduct);
router.post("/:id/images", requireAuth, upload.array("images", 8), postProductImages);
router.delete("/:id/images/:imageId", requireAuth, removeProductImage);
router.get("/:id/reviews", listReviewsHandler("product"));
router.post("/:id/reviews", requireAuth, postReviewHandler("product"));

export default router;
