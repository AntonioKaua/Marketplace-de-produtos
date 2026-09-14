import { Request, Response } from "express";

import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../services/category.service.js";

// Normaliza e valida os dados usados ao criar ou editar uma categoria.
function parseCategoryInput(body: unknown) {
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const parentId =
    input.parentId === null || input.parentId === undefined || input.parentId === ""
      ? null
      : Number(input.parentId);

  const errors: Record<string, string> = {};

  if (name.length < 2 || name.length > 100) {
    errors.name = "O nome deve possuir entre 2 e 100 caracteres.";
  }

  if (parentId !== null && !Number.isInteger(parentId)) {
    errors.parentId = "Categoria pai inválida.";
  }

  return { data: { name, description, parentId }, errors };
}

// Retorna categorias para navegação e formulários de anúncio.
export async function getCategories(_req: Request, res: Response) {
  try {
    const categories = await listCategories();
    return res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao listar categorias.",
    });
  }
}

// Cria uma categoria depois de validar nome e categoria pai opcional.
export async function postCategory(req: Request, res: Response) {
  try {
    const { data, errors } = parseCategoryInput(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ success: false, message: "Verifique os dados informados.", errors });
    }

    const category = await createCategory(data);
    return res.status(201).json({ success: true, category });
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao criar categoria.",
    });
  }
}

// Atualiza uma categoria existente identificada pelo parâmetro da URL.
export async function putCategory(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Categoria inválida." });
    }

    const { data, errors } = parseCategoryInput(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ success: false, message: "Verifique os dados informados.", errors });
    }

    const category = await updateCategory(id, data);

    if (!category) {
      return res.status(404).json({ success: false, message: "Categoria não encontrada." });
    }

    return res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao atualizar categoria.",
    });
  }
}

// Exclui uma categoria identificada pelo parâmetro da URL.
export async function removeCategory(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Categoria inválida." });
    }

    await deleteCategory(id);
    return res.status(200).json({ success: true, message: "Categoria removida." });
  } catch (error) {
    console.error("Erro ao remover categoria:", error);
    return res.status(500).json({
      success: false,
      message: "Erro interno ao remover categoria.",
    });
  }
}
