import { NextFunction, Request, Response } from "express";

import {
  ACCESS_TOKEN_COOKIE,
  verifyAccessToken,
} from "../services/token.service.js";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Autenticação necessária.",
    });
  }

  try {
    res.locals.auth = await verifyAccessToken(token);
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Sessão inválida ou expirada.",
    });
  }
}
