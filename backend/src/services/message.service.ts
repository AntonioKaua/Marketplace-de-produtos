import { supabase } from "../config/supabase.js";

export async function listMessages(conversationId: number) {
  const { data, error } = await supabase
    .from("messages")
    .select("id_messages, sender_id, content, creation_date")
    .eq("id_conversations", conversationId)
    .order("creation_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(row => ({
    id: row.id_messages,
    senderId: row.sender_id,
    content: row.content,
    creationDate: row.creation_date,
  }));
}

export async function createMessage(conversationId: number, senderId: number, content: string) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ id_conversations: conversationId, sender_id: senderId, content })
    .select("id_messages, sender_id, content, creation_date")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id_conversations", conversationId);

  return {
    id: data.id_messages,
    senderId: data.sender_id,
    content: data.content,
    creationDate: data.creation_date,
  };
}
