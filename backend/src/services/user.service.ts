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
  role: string;
}

interface UserCredentialsRow extends Omit<UserCredentials, "id"> {
  id_user: number;
}

interface PublicUserRow {
  id_user: number;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export async function findUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id_user")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findUserByCpf(cpf: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id_user")
    .eq("cpf", cpf)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function findUserCredentialsByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id_user, name, email, phone, password, role")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as UserCredentialsRow | null;

  return row
    ? {
        id: row.id_user,
        name: row.name,
        email: row.email,
        phone: row.phone,
        password: row.password,
        role: row.role,
      }
    : null;
}

export async function findPublicUserById(id: number) {
  const { data, error } = await supabase
    .from("users")
    .select("id_user, name, email, phone, role")
    .eq("id_user", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as PublicUserRow | null;

  return row
    ? {
        id: row.id_user,
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: row.role,
      }
    : null;
}

export async function updateUserProfile(
  id: number,
  data: { name: string; phone: string },
) {
  const { data: user, error } = await supabase
    .from("users")
    .update({
      name: data.name,
      phone: data.phone,
      update_date: new Date().toISOString(),
    })
    .eq("id_user", id)
    .select("id_user, name, email, phone, role")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: user.id_user,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
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
    .select("id_user, name, cpf, email, phone, creation_date")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: user.id_user,
    name: user.name,
    cpf: user.cpf,
    email: user.email,
    phone: user.phone,
    creationDate: user.creation_date,
  };
}
