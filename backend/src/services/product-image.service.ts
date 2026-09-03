import { randomUUID } from "node:crypto";

import { supabase } from "../config/supabase.js";

const BUCKET = "product-images";

export async function uploadProductImage(
  productId: number,
  file: { buffer: Buffer; mimetype: string; originalname: string },
  position: number,
) {
  const extension = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
  const path = `products/${productId}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: image, error } = await supabase
    .from("product_images")
    .insert({
      id_products: productId,
      url: publicUrlData.publicUrl,
      path,
      position,
    })
    .select("id_product_images, url, position")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: image.id_product_images as number,
    url: image.url as string,
  };
}

export async function deleteProductImage(productId: number, imageId: number) {
  const { data: image, error: fetchError } = await supabase
    .from("product_images")
    .select("id_product_images, path")
    .eq("id_product_images", imageId)
    .eq("id_products", productId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!image) {
    return false;
  }

  const { error: storageError } = await supabase.storage.from(BUCKET).remove([image.path]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id_product_images", imageId);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function countProductImages(productId: number) {
  const { count, error } = await supabase
    .from("product_images")
    .select("id_product_images", { count: "exact", head: true })
    .eq("id_products", productId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
