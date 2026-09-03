import { Request, Response } from "express";

import { deleteUser, listAllUsers, updateUserRole } from "../services/admin.service.js";
import { deleteProduct, listProducts } from "../services/product.service.js";

export async function getUsers(_req: Request, res: Response) {
  try {
    const users = await listAllUsers();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao listar usuários." });
  }
}

export async function patchUserRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const role = req.body?.role;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Usuário inválido." });
    }

    if (role !== "user" && role !== "admin") {
      return res.status(422).json({ success: false, message: "Papel inválido. Use 'user' ou 'admin'." });
    }

    if (id === res.locals.auth.userId && role === "user") {
      return res.status(422).json({ success: false, message: "Você não pode remover seu próprio acesso de admin." });
    }

    const user = await updateUserRole(id, role);

    if (!user) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Erro ao atualizar papel do usuário:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao atualizar usuário." });
  }
}

export async function removeUser(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Usuário inválido." });
    }

    if (id === res.locals.auth.userId) {
      return res.status(422).json({ success: false, message: "Você não pode remover sua própria conta por aqui." });
    }

    await deleteUser(id);
    return res.status(200).json({ success: true, message: "Usuário removido." });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao remover usuário." });
  }
}

export async function getAdminProducts(_req: Request, res: Response) {
  try {
    const result = await listProducts({ onlyActive: false, limit: 60 });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao listar produtos." });
  }
}

export async function removeAdminProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Produto inválido." });
    }

    await deleteProduct(id);
    return res.status(200).json({ success: true, message: "Produto removido." });
  } catch (error) {
    console.error("Erro ao remover produto:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao remover produto." });
  }
}
