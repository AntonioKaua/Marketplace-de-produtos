import { Request, Response } from "express";

import { getAverageRating, listReviews, ReviewTarget, upsertReview } from "../services/review.service.js";

function parseReviewInput(body: unknown) {
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const rating = Number(input.rating);
  const comment = typeof input.comment === "string" ? input.comment.trim().slice(0, 2000) : null;
  const errors: Record<string, string> = {};

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "A nota deve ser um número inteiro entre 1 e 5.";
  }

  return { data: { rating, comment: comment || null }, errors };
}

export function listReviewsHandler(target: ReviewTarget) {
  return async (req: Request, res: Response) => {
    try {
      const targetId = Number(req.params.id);

      if (!Number.isInteger(targetId)) {
        return res.status(400).json({ success: false, message: "Identificador inválido." });
      }

      const [reviews, rating] = await Promise.all([
        listReviews(target, targetId),
        getAverageRating(target, targetId),
      ]);

      return res.status(200).json({ success: true, reviews, rating });
    } catch (error) {
      console.error("Erro ao listar avaliações:", error);
      return res.status(500).json({ success: false, message: "Erro interno ao listar avaliações." });
    }
  };
}

export function postReviewHandler(target: ReviewTarget) {
  return async (req: Request, res: Response) => {
    try {
      const targetId = Number(req.params.id);

      if (!Number.isInteger(targetId)) {
        return res.status(400).json({ success: false, message: "Identificador inválido." });
      }

      if (target === "seller" && targetId === res.locals.auth.userId) {
        return res.status(422).json({ success: false, message: "Você não pode avaliar a si mesmo." });
      }

      const { data, errors } = parseReviewInput(req.body);

      if (Object.keys(errors).length > 0) {
        return res.status(422).json({ success: false, message: "Verifique os dados informados.", errors });
      }

      await upsertReview(target, targetId, res.locals.auth.userId, data.rating, data.comment);

      return res.status(201).json({ success: true, message: "Avaliação registrada com sucesso." });
    } catch (error) {
      console.error("Erro ao registrar avaliação:", error);
      return res.status(500).json({ success: false, message: "Erro interno ao registrar avaliação." });
    }
  };
}
