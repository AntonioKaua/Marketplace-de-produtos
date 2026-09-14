import { NextFunction, Request, Response } from "express";

// Deve ser usado depois de requireAuth; bloqueia quem não possui role "admin".
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (res.locals.auth?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acesso restrito a administradores.",
    });
  }

  return next();
}
