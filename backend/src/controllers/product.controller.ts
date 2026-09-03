import { Request, Response } from "express";

import { countProductImages, deleteProductImage, uploadProductImage } from "../services/product-image.service.js";
import { getAverageRating } from "../services/review.service.js";
import {
  createProduct,
  deleteProduct,
  findProductOwner,
  getProductById,
  listProducts,
  ProductData,
  updateProduct,
} from "../services/product.service.js";

const CONDITIONS = ["novo", "usado"];
const MAX_IMAGES_PER_PRODUCT = 8;

function parseProductInput(body: unknown, partial: boolean) {
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const errors: Record<string, string> = {};

  const has = (key: string) => Object.prototype.hasOwnProperty.call(input, key);
  const data: Partial<ProductData> = {};

  if (!partial || has("title")) {
    const title = typeof input.title === "string" ? input.title.trim() : "";
    if (title.length < 3 || title.length > 150) {
      errors.title = "O título deve possuir entre 3 e 150 caracteres.";
    }
    data.title = title;
  }

  if (!partial || has("price")) {
    const price = Number(input.price);
    if (!Number.isFinite(price) || price <= 0) {
      errors.price = "Informe um preço válido maior que zero.";
    }
    data.price = price;
  }

  if (!partial || has("quantity")) {
    const quantity = Number(input.quantity);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 32767) {
      errors.quantity = "Informe uma quantidade válida.";
    }
    data.quantity = quantity;
  }

  if (!partial || has("description")) {
    const description = typeof input.description === "string" ? input.description.trim() : "";
    if (description.length < 10 || description.length > 5000) {
      errors.description = "A descrição deve possuir entre 10 e 5000 caracteres.";
    }
    data.description = description;
  }

  if (!partial || has("condition")) {
    const condition = typeof input.condition === "string" ? input.condition.trim().toLowerCase() : "";
    if (!CONDITIONS.includes(condition)) {
      errors.condition = "Selecione o estado do produto (novo ou usado).";
    }
    data.condition = condition;
  }

  if (has("year")) {
    const yearValue = input.year;
    if (yearValue === null || yearValue === "" || yearValue === undefined) {
      data.year = null;
    } else {
      const year = Number(yearValue);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(year) || year < 1900 || year > currentYear + 1) {
        errors.year = "Informe um ano válido.";
      }
      data.year = year;
    }
  }

  if (has("model")) {
    const model = typeof input.model === "string" ? input.model.trim() : "";
    data.model = model.length > 0 ? model : null;
  }

  if (has("categoryId")) {
    const categoryIdValue = input.categoryId;
    if (categoryIdValue === null || categoryIdValue === "" || categoryIdValue === undefined) {
      data.categoryId = null;
    } else {
      const categoryId = Number(categoryIdValue);
      if (!Number.isInteger(categoryId)) {
        errors.categoryId = "Categoria inválida.";
      }
      data.categoryId = categoryId;
    }
  }

  return { data, errors };
}

export async function getProducts(req: Request, res: Response) {
  try {
    const { q, categoryId, minPrice, maxPrice, page, limit } = req.query;

    const result = await listProducts({
      q: typeof q === "string" && q.trim() ? q.trim() : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao listar produtos." });
  }
}

export async function getMyProducts(req: Request, res: Response) {
  try {
    const result = await listProducts({
      sellerId: res.locals.auth.userId,
      onlyActive: false,
      limit: 60,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Erro ao listar meus produtos:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao listar seus produtos." });
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Produto inválido." });
    }

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Produto não encontrado." });
    }

    const rating = await getAverageRating("product", id);

    return res.status(200).json({ success: true, product: { ...product, rating } });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao buscar produto." });
  }
}

export async function postProduct(req: Request, res: Response) {
  try {
    const { data, errors } = parseProductInput(req.body, false);

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ success: false, message: "Verifique os dados informados.", errors });
    }

    const product = await createProduct(res.locals.auth.userId, data as ProductData);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao criar produto." });
  }
}

async function assertOwnerOrAdmin(req: Request, res: Response, productId: number) {
  const ownerId = await findProductOwner(productId);

  if (ownerId === undefined) {
    res.status(404).json({ success: false, message: "Produto não encontrado." });
    return false;
  }

  if (ownerId !== res.locals.auth.userId && res.locals.auth.role !== "admin") {
    res.status(403).json({ success: false, message: "Você não tem permissão para alterar este produto." });
    return false;
  }

  return true;
}

export async function putProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Produto inválido." });
    }

    if (!(await assertOwnerOrAdmin(req, res, id))) return;

    const { data, errors } = parseProductInput(req.body, true);

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ success: false, message: "Verifique os dados informados.", errors });
    }

    const product = await updateProduct(id, data);
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao atualizar produto." });
  }
}

export async function removeProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Produto inválido." });
    }

    if (!(await assertOwnerOrAdmin(req, res, id))) return;

    await deleteProduct(id);
    return res.status(200).json({ success: true, message: "Produto removido." });
  } catch (error) {
    console.error("Erro ao remover produto:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao remover produto." });
  }
}

export async function postProductImages(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Produto inválido." });
    }

    if (!(await assertOwnerOrAdmin(req, res, id))) return;

    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (files.length === 0) {
      return res.status(400).json({ success: false, message: "Envie ao menos uma imagem." });
    }

    const existingCount = await countProductImages(id);

    if (existingCount + files.length > MAX_IMAGES_PER_PRODUCT) {
      return res.status(422).json({
        success: false,
        message: `Cada produto pode ter no máximo ${MAX_IMAGES_PER_PRODUCT} imagens.`,
      });
    }

    const images = [];
    for (const [index, file] of files.entries()) {
      images.push(await uploadProductImage(id, file, existingCount + index));
    }

    return res.status(201).json({ success: true, images });
  } catch (error) {
    console.error("Erro ao enviar imagem:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao enviar imagem." });
  }
}

export async function removeProductImage(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const imageId = Number(req.params.imageId);

    if (!Number.isInteger(id) || !Number.isInteger(imageId)) {
      return res.status(400).json({ success: false, message: "Parâmetros inválidos." });
    }

    if (!(await assertOwnerOrAdmin(req, res, id))) return;

    const removed = await deleteProductImage(id, imageId);

    if (!removed) {
      return res.status(404).json({ success: false, message: "Imagem não encontrada." });
    }

    return res.status(200).json({ success: true, message: "Imagem removida." });
  } catch (error) {
    console.error("Erro ao remover imagem:", error);
    return res.status(500).json({ success: false, message: "Erro interno ao remover imagem." });
  }
}
