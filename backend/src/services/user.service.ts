import { supabase } from "../config/supabase.js";

interface CreateUserData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
}

export interface UserCredentials {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
}

export async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findUserCredentialsByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone, password")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as UserCredentials | null;
}

export async function findPublicUserById(id: number) {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, phone")
    .eq("id", id)
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
