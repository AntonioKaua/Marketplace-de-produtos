import { NextFunction, Request, Response } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (res.locals.auth?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acesso restrito a administradores.",
    });
  }

  return next();
}
