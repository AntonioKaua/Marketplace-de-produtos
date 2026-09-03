import { Request, Response } from "express";

import { addFavorite, isFavorite, listFavorites, removeFavorite } from "../services/favorite.service.js";

export async function getFavorites(_req: Request, res: Response) {
  try {
    const favorites = await listFavorites(res.locals.auth.userId);
    return res.status(200).json({ success: true, favorites });
  } catch (error) {
    console.error("Erro ao listar favoritos:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao listar favoritos." });
  }
}

export async function getFavoriteStatus(req: Request, res: Response) {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ success: false, message: "Produto inválido." });
    }

    const favorited = await isFavorite(res.locals.auth.userId, productId);
    return res.status(200).json({ success: true, isFavorite: favorited });
  } catch (error) {
    console.error("Erro ao consultar favorito:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao consultar favorito." });
  }
}

export async function postFavorite(req: Request, res: Response) {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ success: false, message: "Produto inválido." });
    }

    await addFavorite(res.locals.auth.userId, productId);
    return res.status(201).json({ success: true, message: "Produto adicionado aos favoritos." });
  } catch (error) {
    console.error("Erro ao favoritar produto:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao favoritar produto." });
  }
}

export async function deleteFavorite(req: Request, res: Response) {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ success: false, message: "Produto inválido." });
    }

    await removeFavorite(res.locals.auth.userId, productId);
    return res.status(200).json({ success: true, message: "Produto removido dos favoritos." });
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao remover favorito." });
  }
}
