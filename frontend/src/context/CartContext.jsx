import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "dts_cart";

function loadInitialCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadInitialCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // armazenamento indisponível (ex: modo privado) — carrinho segue só em memória
    }
  }, [cart]);

  const add = (product, quantity = 1) => {
    setCart(current => {
      const found = current.find(item => item.id === product.id);

      if (found) {
        return current.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + quantity } : item,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images?.[0]?.url ?? null,
          sellerName: product.seller?.name ?? "",
          stock: product.quantity,
          qty: quantity,
        },
      ];
    });
  };

  const remove = id => setCart(current => current.filter(item => item.id !== id));

  const setQty = (id, quantity) =>
    setCart(current =>
      current.map(item => (item.id === id ? { ...item, qty: Math.max(1, quantity) } : item)),
    );

  const clear = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, add, remove, setQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart deve ser usado dentro de CartProvider.");
  }

  return context;
}
