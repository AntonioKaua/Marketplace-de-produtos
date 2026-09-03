import { supabase } from "../config/supabase.js";

export async function getSellerProfile(id: number) {
  const { data: user, error } = await supabase
    .from("users")
    .select("id_user, name, creation_date")
    .eq("id_user", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    return null;
  }

  const { count, error: countError } = await supabase
    .from("products")
    .select("id_products", { count: "exact", head: true })
    .eq("id_user", id)
    .eq("status", "active");

  if (countError) {
    throw new Error(countError.message);
  }

  return {
    id: user.id_user,
    name: user.name,
    memberSince: user.creation_date,
    activeProducts: count ?? 0,
  };
}
