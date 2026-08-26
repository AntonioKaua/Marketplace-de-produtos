import { Request, Response } from "express";
import bcrypt from "bcrypt";

import {
  createUser,
  findUserByEmail,
  findUserCredentialsByEmail,
  findPublicUserById,
} from "../services/user.service.js";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  createAccessToken,
} from "../services/token.service.js";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: "/",
  };
}

export async function registerUser(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      phone,
      cpf,
      password,
    } = req.body;

    if (
      !isNonEmptyString(name) ||
      !isNonEmptyString(email) ||
      !isNonEmptyString(phone) ||
      !isNonEmptyString(cpf) ||
      !isNonEmptyString(password)
    ) {
      return res.status(400).json({
        success: false,
        message: "Nome, email, telefone, CPF e senha são obrigatórios.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "A senha deve possuir pelo menos 6 caracteres.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Este email já está cadastrado.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await createUser({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      cpf: cpf.trim(),
      password: passwordHash,
    });

    return res.status(201).json({
      success: true,
      message: "Usuário cadastrado com sucesso.",
      user,
    });

  } catch (error) {
    console.error("Erro no cadastro:", error);

    return res.status(500).json({
      success: false,
      message: "Erro interno ao cadastrar usuário.",
    });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({
        success: false,
        message: "Email e senha são obrigatórios.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await findUserCredentialsByEmail(normalizedEmail);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Email ou senha inválidos.",
      });
    }

    const token = await createAccessToken({
      userId: user.id,
      email: user.email,
    });

    res.cookie(ACCESS_TOKEN_COOKIE, token, authCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login realizado com sucesso.",
      expiresIn: 3600,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      success: false,
      message: "Erro interno ao realizar login.",
    });
  }
}

export async function getCurrentUser(_req: Request, res: Response) {
  try {
    const user = await findPublicUserById(res.locals.auth.userId);

    if (!user) {
      res.clearCookie(ACCESS_TOKEN_COOKIE, authCookieOptions());

      return res.status(401).json({
        success: false,
        message: "Usuário da sessão não encontrado.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Erro ao consultar sessão:", error);

    return res.status(500).json({
      success: false,
      message: "Erro interno ao consultar sessão.",
    });
  }
}

export function logoutUser(_req: Request, res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, authCookieOptions());

  return res.status(200).json({
    success: true,
    message: "Logout realizado com sucesso.",
  });
}
