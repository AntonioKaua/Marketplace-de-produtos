import { Request, Response } from "express";
import bcrypt from "bcrypt";

import {
  createUser,
  findUserByCpf,
  findUserByEmail,
  findUserCredentialsByEmail,
  findPublicUserById,
  updateUserProfile,
} from "../services/user.service.js";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  createAccessToken,
} from "../services/token.service.js";
import {
  validateProfileUpdateInput,
  validateRegistrationInput,
} from "../utils/user-validation.js";

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
    const input = req.body && typeof req.body === "object" ? req.body : {};
    const { data, errors } = validateRegistrationInput(input);

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        success: false,
        message: "Verifique os dados informados.",
        errors,
      });
    }

    const existingUser = await findUserByEmail(data.email);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Este email já está cadastrado.",
        errors: {
          email: "Este email já está cadastrado.",
        },
      });
    }

    const existingCpf = await findUserByCpf(data.cpf);

    if (existingCpf) {
      return res.status(409).json({
        success: false,
        message: "Este CPF já está cadastrado.",
        errors: {
          cpf: "Este CPF já está cadastrado.",
        },
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await createUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
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
      role: user.role,
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
        role: user.role,
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

export async function updateProfile(req: Request, res: Response) {
  try {
    const input = req.body && typeof req.body === "object" ? req.body : {};
    const { data, errors } = validateProfileUpdateInput(input);

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({
        success: false,
        message: "Verifique os dados informados.",
        errors,
      });
    }

    const user = await updateUserProfile(res.locals.auth.userId, data);

    return res.status(200).json({
      success: true,
      message: "Perfil atualizado com sucesso.",
      user,
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);

    return res.status(500).json({
      success: false,
      message: "Erro interno ao atualizar perfil.",
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
