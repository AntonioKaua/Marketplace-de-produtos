import { NextFunction, Request, Response } from "express";

import {
  ACCESS_TOKEN_COOKIE,
  verifyAccessToken,
} from "../services/token.service.js";

// Protege rotas privadas: lê o JWT do cookie, valida a assinatura e disponibiliza
// userId, email e role em res.locals.auth para o próximo middleware/controlador.
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

  // Sem cookie não existe sessão para validar.
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Autenticação necessária.",
    });
  }

  try {
    // Só prossegue para a rota se o token estiver válido e não expirado.
    res.locals.auth = await verifyAccessToken(token);
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Sessão inválida ou expirada.",
    });
  }
}
