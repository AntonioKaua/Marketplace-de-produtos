import { supabase } from "../config/supabase.js";

export async function listFavorites(userId: number) {
  const { data, error } = await supabase
    .from("favorites")
    .select(
      `id_favorites, creation_date,
       product:id_products (
         id_products, title, price, condition, status,
         product_images ( url, position )
       )`,
    )
    .eq("id_user", userId)
    .order("creation_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: any) => ({
    favoriteId: row.id_favorites,
    creationDate: row.creation_date,
    product: row.product
      ? {
          id: row.product.id_products,
          title: row.product.title,
          price: Number(row.product.price),
          condition: row.product.condition,
          status: row.product.status,
          image:
            (row.product.product_images ?? [])
              .slice()
              .sort((a: any, b: any) => a.position - b.position)[0]?.url ?? null,
        }
      : null,
  }));
}

export async function isFavorite(userId: number, productId: number) {
  const { data, error } = await supabase
    .from("favorites")
    .select("id_favorites")
    .eq("id_user", userId)
    .eq("id_products", productId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function addFavorite(userId: number, productId: number) {
  const { error } = await supabase
    .from("favorites")
    .upsert(
      { id_user: userId, id_products: productId },
      { onConflict: "id_user,id_products", ignoreDuplicates: true },
    );

  if (error) {
    throw new Error(error.message);
  }
}

export async function removeFavorite(userId: number, productId: number) {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("id_user", userId)
    .eq("id_products", productId);

  if (error) {
    throw new Error(error.message);
  }
}
