export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.filter(item => {
    if (!item || !Number.isSafeInteger(item.id) || item.id <= 0 || seen.has(item.id)
      || !Number.isSafeInteger(item.qty) || item.qty < 1
      || !Number.isSafeInteger(item.stock) || item.stock < 0
      || !Number.isFinite(item.price) || item.price < 0) return false;
    seen.add(item.id);
    return true;
  });
}

export function refreshCartItem(item, product) {
  return {
    ...item,
    title: product.title,
    price: product.price,
    image: product.images?.[0]?.url ?? null,
    sellerName: product.seller?.name ?? "",
    stock: product.status === "active" ? product.quantity : 0,
  };
}

export function addCartItem(cart, product, quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 1
    || !Number.isSafeInteger(product.quantity) || product.quantity < 1
    || product.status !== "active") return cart;
  const found = cart.find(item => item.id === product.id);
  const updated = refreshCartItem({ id: product.id }, product);
  const qty = Math.min((found?.qty ?? 0) + quantity, updated.stock);
  return found ? cart.map(item => item.id === product.id ? { ...updated, qty } : item)
    : [...cart, { ...updated, qty }];
}
