import { supabase } from "../config/supabase";

interface CreateUserData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
}

export async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, cpf, phone, password")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createUser(data: CreateUserData) {
  const { data: user, error } = await supabase
    .from("users")
    .insert({
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      phone: data.phone,
      password: data.password,
    })
    .select("id, name, cpf, email, phone, creation_date")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return user;
}