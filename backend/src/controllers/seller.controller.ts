import { Request, Response } from "express";

import { getAverageRating } from "../services/review.service.js";
import { getSellerProfile } from "../services/seller.service.js";

export async function getSeller(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Vendedor inválido." });
    }

    const seller = await getSellerProfile(id);

    if (!seller) {
      return res.status(404).json({ success: false, message: "Vendedor não encontrado." });
    }

    const rating = await getAverageRating("seller", id);

    return res.status(200).json({ success: true, seller: { ...seller, rating } });
  } catch (error) {
    console.error("Erro ao buscar vendedor:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao buscar vendedor." });
  }
}
