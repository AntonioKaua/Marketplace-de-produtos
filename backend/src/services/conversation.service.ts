import { supabase } from "../config/supabase.js";

export async function findOrCreateConversation(
  buyerId: number,
  sellerId: number,
  productId: number | null,
) {
  let query = supabase
    .from("conversations")
    .select("id_conversations")
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId);

  query = productId === null ? query.is("id_products", null) : query.eq("id_products", productId);

  const { data: existing, error: findError } = await query.maybeSingle();

  if (findError) {
    throw new Error(findError.message);
  }

  if (existing) {
    return existing.id_conversations as number;
  }

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({ buyer_id: buyerId, seller_id: sellerId, id_products: productId })
    .select("id_conversations")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return created.id_conversations as number;
}

export async function getConversationById(id: number) {
  const { data, error } = await supabase
    .from("conversations")
    .select("id_conversations, buyer_id, seller_id, id_products")
    .eq("id_conversations", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data
    ? {
        id: data.id_conversations as number,
        buyerId: data.buyer_id as number,
        sellerId: data.seller_id as number,
        productId: data.id_products as number | null,
      }
    : null;
}

export async function listConversations(userId: number) {
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `id_conversations, last_message_at, id_products,
       buyer:buyer_id ( id_user, name ),
       seller:seller_id ( id_user, name ),
       product:id_products ( id_products, title )`,
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: any) => {
    const otherParty = row.buyer?.id_user === userId ? row.seller : row.buyer;

    return {
      id: row.id_conversations,
      lastMessageAt: row.last_message_at,
      product: row.product ? { id: row.product.id_products, title: row.product.title } : null,
      otherParty: otherParty ? { id: otherParty.id_user, name: otherParty.name } : null,
    };
  });
}
