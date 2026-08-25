import { Request, Response } from "express";
import bcrypt from "bcrypt";

import {
  createUser,
  findUserByEmail,
} from "../services/user.service";

export async function registerUser(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      phone,
      cpf,
      password,
    } = req.body;

    if (!name || !email || !phone || !cpf || !password) {
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