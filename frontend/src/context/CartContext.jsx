import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

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

    return rawCart ? JSON.parse(rawCart) : [];
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
    setCart(current => {
      const found = current.find(item => item.id === product.id);

      // Produto já existe no carrinho.
      if (found) {
        return current.map(item => {
          // Produtos diferentes não mudam.
          if (item.id !== product.id) {
            return item;
          }

          // Não adiciona além da quantidade disponível.
          if (item.qty + quantity > item.stock) {
            return item;
          }

          return {
            ...item,
            qty: item.qty + quantity,
          };
        });
      }

      // Impede que um produto novo entre com quantidade acima do estoque.
      const initialQuantity = Math.min(quantity, product.quantity);

      return [
        ...current,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images?.[0]?.url ?? null,
          sellerName: product.seller?.name ?? "",
          stock: product.quantity,
          qty: initialQuantity,
        },
      ];
    });
  };

  const remove = id => {
    setCart(current => {
      return current.filter(item => item.id !== id);
    });
  };

  const setQty = (id, quantity) => {
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
  const clear = () => {
    setCart([]);
  };

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