import { supabase } from "../config/supabase.js";

const PRODUCT_SELECT = `
  id_products, title, price, quantity, description, condition,
  creation_date, update_date, year, model, category_id, id_user, status,
  category:category_id ( id_category, name ),
  seller:id_user ( id_user, name ),
  product_images ( id_product_images, url, position )
`;

interface ProductRow {
  id_products: number;
  title: string;
  price: number;
  quantity: number;
  description: string;
  condition: string;
  creation_date: string;
  update_date: string | null;
  year: number | null;
  model: string | null;
  category_id: number | null;
  id_user: number;
  status: string;
  category: { id_category: number; name: string } | null;
  seller: { id_user: number; name: string } | null;
  product_images: { id_product_images: number; url: string; position: number }[] | null;
}

export interface ProductData {
  title: string;
  price: number;
  quantity: number;
  description: string;
  condition: string;
  year: number | null;
  model: string | null;
  categoryId: number | null;
}

export interface ListProductsParams {
  q?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: number;
  page?: number;
  limit?: number;
  onlyActive?: boolean;
}

function mapProduct(row: ProductRow) {
  return {
    id: row.id_products,
    title: row.title,
    price: Number(row.price),
    quantity: row.quantity,
    description: row.description,
    condition: row.condition,
    year: row.year,
    model: row.model,
    status: row.status,
    creationDate: row.creation_date,
    updateDate: row.update_date,
    category: row.category ? { id: row.category.id_category, name: row.category.name } : null,
    seller: row.seller ? { id: row.seller.id_user, name: row.seller.name } : null,
    images: (row.product_images ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map(image => ({ id: image.id_product_images, url: image.url })),
  };
}

export async function listProducts(params: ListProductsParams) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 && params.limit <= 60 ? params.limit : 24;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .order("creation_date", { ascending: false })
    .range(from, to);

  if (params.onlyActive !== false) {
    query = query.eq("status", "active");
  }

  if (params.q) {
    const term = params.q.replace(/[%_]/g, "");
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (params.categoryId) {
    query = query.eq("category_id", params.categoryId);
  }

  if (params.minPrice !== undefined) {
    query = query.gte("price", params.minPrice);
  }

  if (params.maxPrice !== undefined) {
    query = query.lte("price", params.maxPrice);
  }

  if (params.sellerId) {
    query = query.eq("id_user", params.sellerId);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    products: (data as unknown as ProductRow[]).map(mapProduct),
    total: count ?? 0,
    page,
    limit,
  };
}

export async function getProductById(id: number) {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id_products", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProduct(data as unknown as ProductRow) : null;
}

export async function createProduct(sellerId: number, data: ProductData) {
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      title: data.title,
      price: data.price,
      quantity: data.quantity,
      description: data.description,
      condition: data.condition,
      year: data.year,
      model: data.model,
      category_id: data.categoryId,
      id_user: sellerId,
      creation_date: new Date().toISOString(),
    })
    .select(PRODUCT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProduct(product as unknown as ProductRow);
}

export async function updateProduct(id: number, data: Partial<ProductData> & { status?: string }) {
  const payload: Record<string, unknown> = { update_date: new Date().toISOString() };

  if (data.title !== undefined) payload.title = data.title;
  if (data.price !== undefined) payload.price = data.price;
  if (data.quantity !== undefined) payload.quantity = data.quantity;
  if (data.description !== undefined) payload.description = data.description;
  if (data.condition !== undefined) payload.condition = data.condition;
  if (data.year !== undefined) payload.year = data.year;
  if (data.model !== undefined) payload.model = data.model;
  if (data.categoryId !== undefined) payload.category_id = data.categoryId;
  if (data.status !== undefined) payload.status = data.status;

  const { data: product, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id_products", id)
    .select(PRODUCT_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return product ? mapProduct(product as unknown as ProductRow) : null;
}

export async function deleteProduct(id: number) {
  const { error } = await supabase.from("products").delete().eq("id_products", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function findProductOwner(id: number) {
  const { data, error } = await supabase
    .from("products")
    .select("id_user")
    .eq("id_products", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id_user as number | undefined;
}

export async function decrementStock(id: number, quantity: number) {
  const { error } = await supabase.rpc("decrement_product_stock", {
    product_id: id,
    amount: quantity,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function restockProduct(id: number, quantity: number) {
  const { data, error: fetchError } = await supabase
    .from("products")
    .select("quantity")
    .eq("id_products", id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!data) return;

  const { error } = await supabase
    .from("products")
    .update({ quantity: data.quantity + quantity })
    .eq("id_products", id);

  if (error) {
    throw new Error(error.message);
  }
}
