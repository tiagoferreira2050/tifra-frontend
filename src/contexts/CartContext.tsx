"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

/* =======================
   CONFIG
======================= */
const CART_STORAGE_KEY = "delivery_cart_v1";
const CART_TTL_MS = 45 * 60 * 1000; // 45 minutos

/* =======================
   TYPES
======================= */
export type CartItem = {
  id: string;
  productId: string;
  name: string;
  qty: number;
  unitPrice: number; // 🔥 preço UNITÁRIO (produto + complementos)
  complements?: Record<string, Record<string, number>>;
};

type StoredCart = {
  items: CartItem[];
  expiresAt: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
};

/* =======================
   CONTEXT
======================= */
const CartContext = createContext<CartContextType | null>(null);

/* =======================
   PROVIDER
======================= */
export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  /* =======================
     LOAD CART (INIT)
  ======================= */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;

      const stored: StoredCart = JSON.parse(raw);

      // ⏱️ expirou
      if (Date.now() > stored.expiresAt) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return;
      }

      setItems(stored.items);
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  /* =======================
     SAVE CART (ON CHANGE)
  ======================= */
  useEffect(() => {
    if (items.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    const payload: StoredCart = {
      items,
      expiresAt: Date.now() + CART_TTL_MS, // renova o tempo
    };

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(payload)
    );
  }, [items]);

  /* =======================
     ACTIONS
  ======================= */
  function addItem(item: CartItem) {
    setItems((prev) => [...prev, item]);
  }

  function updateQty(id: string, qty: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty } : item
      )
    );
  }

  function removeItem(id: string) {
    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  /* =======================
     TOTAL
  ======================= */
  const total = items.reduce(
    (acc, item) => acc + item.unitPrice * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =======================
   HOOK
======================= */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error(
      "useCart deve estar dentro do CartProvider"
    );
  }
  return ctx;
}
