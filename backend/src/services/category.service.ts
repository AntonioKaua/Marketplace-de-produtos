import { supabase } from "../config/supabase.js";

export interface CategoryData {
  name: string;
  description: string;
  parentId: number | null;
}

function mapCategory(row: {
  id_category: number;
  name: string;
  description: string;
  id_category_dad: number | null;
}) {
  return {
    id: row.id_category,
    name: row.name,
    description: row.description,
    parentId: row.id_category_dad,
  };
}

export async function listCategories() {
  const { data, error } = await supabase
    .from("category")
    .select("id_category, name, description, id_category_dad")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapCategory);
}

export async function findCategoryById(id: number) {
  const { data, error } = await supabase
    .from("category")
    .select("id_category, name, description, id_category_dad")
    .eq("id_category", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapCategory(data) : null;
}

export async function createCategory(data: CategoryData) {
  const { data: category, error } = await supabase
    .from("category")
    .insert({
      name: data.name,
      description: data.description,
      id_category_dad: data.parentId,
    })
    .select("id_category, name, description, id_category_dad")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapCategory(category);
}

export async function updateCategory(id: number, data: CategoryData) {
  const { data: category, error } = await supabase
    .from("category")
    .update({
      name: data.name,
      description: data.description,
      id_category_dad: data.parentId,
    })
    .eq("id_category", id)
    .select("id_category, name, description, id_category_dad")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return category ? mapCategory(category) : null;
}

export async function deleteCategory(id: number) {
  const { error } = await supabase
    .from("category")
    .delete()
    .eq("id_category", id);

  if (error) {
    throw new Error(error.message);
  }
}
