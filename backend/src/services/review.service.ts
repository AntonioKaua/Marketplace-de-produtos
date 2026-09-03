import { supabase } from "../config/supabase.js";

export type ReviewTarget = "product" | "seller";

function tableFor(target: ReviewTarget) {
  return target === "product" ? "product_reviews" : "seller_reviews";
}

function targetColumnFor(target: ReviewTarget) {
  return target === "product" ? "id_products" : "id_seller";
}

export async function listReviews(target: ReviewTarget, targetId: number) {
  const { data, error } = await supabase
    .from(tableFor(target))
    .select(
      `rating, comment, creation_date,
       author:id_user ( id_user, name )`,
    )
    .eq(targetColumnFor(target), targetId)
    .order("creation_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: any) => ({
    rating: row.rating,
    comment: row.comment,
    creationDate: row.creation_date,
    author: row.author ? { id: row.author.id_user, name: row.author.name } : null,
  }));
}

export async function getAverageRating(target: ReviewTarget, targetId: number) {
  const { data, error } = await supabase
    .from(tableFor(target))
    .select("rating")
    .eq(targetColumnFor(target), targetId);

  if (error) {
    throw new Error(error.message);
  }

  const ratings = (data ?? []).map(row => row.rating as number);
  const count = ratings.length;
  const average = count > 0 ? ratings.reduce((sum, value) => sum + value, 0) / count : 0;

  return { average: Math.round(average * 10) / 10, count };
}

export async function upsertReview(
  target: ReviewTarget,
  targetId: number,
  authorId: number,
  rating: number,
  comment: string | null,
) {
  const { error } = await supabase.from(tableFor(target)).upsert(
    {
      [targetColumnFor(target)]: targetId,
      id_user: authorId,
      rating,
      comment,
    },
    { onConflict: `${targetColumnFor(target)},id_user` },
  );

  if (error) {
    throw new Error(error.message);
  }
}
