import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "./AuthContext.jsx";

// Signed-in customers use the server cart (/cart). Visitors who are not signed in
// keep a local cart, which is merged into the server cart when they log in.

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

const KEY = "shopcore_guest_cart";
const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};
const writeLocal = (items) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable */
  }
};

export function CartProvider({ children }) {
  const { user } = useAuth();
  const uid = user?._id || user?.id || null;
  const [items, setItems] = useState(readLocal);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    const cart = await api.getCart();
    setItems(cart.items);
  }, []);

  // On login: push guest items to the server, then load the server cart.
  // On logout: fall back to an empty guest cart.
  useEffect(() => {
    let cancelled = false;
    if (!uid) {
      setItems(readLocal());
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const guest = readLocal();
        for (const g of guest) {
          try {
            await api.addToCart(g.id, g.qty);
          } catch {
            /* item gone or out of stock: skip it */
          }
        }
        if (guest.length) writeLocal([]);
        const cart = await api.getCart();
        if (!cancelled) setItems(cart.items);
      } catch {
        /* cart stays as is; actions will surface errors */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const local = (fn) =>
    setItems((cur) => {
      const next = fn(cur);
      writeLocal(next);
      return next;
    });

  // product: { id, name, price, image, stock }
  const add = async (product, qty = 1) => {
    if (uid) {
      const cart = await api.addToCart(product.id, qty);
      setItems(cart.items);
      return;
    }
    local((cur) => {
      const found = cur.find((i) => i.id === product.id);
      if (found) return cur.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      return [
        ...cur,
        { id: product.id, name: product.name, price: product.price, image: product.image, stock: product.stock, qty },
      ];
    });
  };

  const remove = async (id) => {
    if (uid) {
      const cart = await api.removeCartItem(id);
      setItems(cart.items);
      return;
    }
    local((cur) => cur.filter((i) => i.id !== id));
  };

  const setQty = async (id, qty) => {
    if (qty < 1) return remove(id);
    if (uid) {
      const cart = await api.updateCartItem(id, qty);
      setItems(cart.items);
      return;
    }
    local((cur) => cur.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const clear = async () => {
    if (uid) {
      await api.clearCart();
      setItems([]);
      return;
    }
    local(() => []);
  };

  const value = useMemo(
    () => ({
      items,
      loading,
      add,
      remove,
      setQty,
      clear,
      reload,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.price, 0),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, loading, uid]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
