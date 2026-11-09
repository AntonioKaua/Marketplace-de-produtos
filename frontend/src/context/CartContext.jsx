import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getProductRequest } from "../services/products";
import { addCartItem, normalizeCart, refreshCartItem } from "../utils/cart";

const CartContext = createContext(null);

// Prefixo comum. O id do usuário será adicionado no final.
// Exemplo: dts_cart_5
const CART_STORAGE_PREFIX = "dts_cart";

const getStorageKey = userId => {
  return `${CART_STORAGE_PREFIX}_${userId}`;
};

const loadCartForUser = userId => {
  // Sem usuário logado, o carrinho visual fica vazio.
  if (!userId) {
    return [];
  }

  try {
    const storageKey = getStorageKey(userId);
    const rawCart = localStorage.getItem(storageKey);

    return normalizeCart(rawCart ? JSON.parse(rawCart) : []);
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const { user, authLoading } = useAuth();

  // Carrinho exibido na tela neste momento.
  const [cart, setCart] = useState([]);

  // Identifica de qual usuário é o carrinho atualmente carregado.
  // Isso evita salvar o carrinho de uma conta na chave de outra.
  const [cartOwnerId, setCartOwnerId] = useState(null);

  const productIds = cart.map(item => item.id).join(",");
  useEffect(() => {
    if (!cartOwnerId || cartOwnerId !== user?.id || !productIds) return;
    let active = true;
    let refreshing = false;
    const refresh = async () => {
      if (refreshing || document.visibilityState === "hidden") return;
      refreshing = true;
      const results = await Promise.all(productIds.split(",").map(async id => {
        try {
          const { product } = await getProductRequest(id);
          return { id: Number(id), product };
        } catch (error) {
          // Uma falha de rede não deve apagar o carrinho.
          return { id: Number(id), product: error.status === 404 ? { status: "missing", quantity: 0 } : null };
        }
      }));
      refreshing = false;
      if (!active) return;
      setCart(current => current.map(item => {
        const product = results.find(result => result.id === item.id)?.product;
        if (!product) return item;
        return product.status === "missing" ? { ...item, stock: 0 } : refreshCartItem(item, product);
      }));
    };
    refresh();
    window.addEventListener("focus", refresh);
    const interval = setInterval(refresh, 30000);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [productIds, cartOwnerId, user?.id]);

  useEffect(() => {
    // Espera a aplicação descobrir se existe uma sessão válida.
    if (authLoading) {
      return;
    }

    const userId = user?.id ?? null;

    // Ao entrar, sair ou trocar de conta, carrega o carrinho correspondente.
    setCart(loadCartForUser(userId));
    setCartOwnerId(userId);
  }, [user?.id, authLoading]);

  useEffect(() => {
    // Não salva carrinho no localStorage se não houver uma conta logada.
    if (!cartOwnerId) {
      return;
    }

    try {
      const storageKey = getStorageKey(cartOwnerId);

      // Salva somente na chave do dono do carrinho atual.
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      // Em modo privado ou sem espaço, o carrinho continua apenas em memória.
    }
  }, [cart, cartOwnerId]);

  const add = (product, quantity = 1) => {
    setCart(current => addCartItem(current, product, quantity));
  };

  const remove = id => {
    setCart(current => {
      return current.filter(item => item.id !== id);
    });
  };

  const setQty = (id, quantity) => {
    if (!Number.isSafeInteger(quantity)) return;
    setCart(current => {
      return current.map(item => {
        // Não altera produtos diferentes do que foi clicado.
        if (item.id !== id) {
          return item;
        }

        // Não aceita quantidade menor que 1.
        if (quantity < 1) {
          return {
            ...item,
            qty: 1,
          };
        }

        // Não aceita quantidade maior que o estoque.
        if (quantity > item.stock) {
          return item;
        }

        return {
          ...item,
          qty: quantity,
        };
      });
    });
  };

  // Esvazia somente o carrinho da conta atualmente carregada.
  const clear = useCallback(() => {
    setCart([]);
  }, []);

  const total = cart.reduce((sum, item) => {
    return sum + item.price * item.qty;
  }, 0);

  const count = cart.reduce((sum, item) => {
    return sum + item.qty;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        add,
        remove,
        setQty,
        clear,
        total,
        count,
      }}
    >
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
