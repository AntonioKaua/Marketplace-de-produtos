import { supabase } from "../config/supabase.js";

export async function listAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id_user, name, email, phone, role, creation_date")
    .order("creation_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(row => ({
    id: row.id_user,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    creationDate: row.creation_date,
  }));
}

export async function updateUserRole(id: number, role: "user" | "admin") {
  const { data, error } = await supabase
    .from("users")
    .update({ role, update_date: new Date().toISOString() })
    .eq("id_user", id)
    .select("id_user, name, email, phone, role")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data
    ? { id: data.id_user, name: data.name, email: data.email, phone: data.phone, role: data.role }
    : null;
}

export async function deleteUser(id: number) {
  const { error } = await supabase.from("users").delete().eq("id_user", id);

  if (error) {
    throw new Error(error.message);
  }
}
