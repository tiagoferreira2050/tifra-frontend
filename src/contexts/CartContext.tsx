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
export type CartComplement = {
  optionId: string;
  optionName: string;
  qty: number;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  imageUrl?: string;
  qty: number;
  unitPrice: number;
  complements?: CartComplement[];
  observation?: string;
};

type StoredCart = {
  storeId: string | null;
  items: CartItem[];
  expiresAt: number;
};

type CartContextType = {
  storeId: string | null;
  setStoreId: (id: string) => void;

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
  const [storeId, setStoreIdState] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);

  /* =======================
     LOAD CART (INIT)
  ======================= */
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;

      const stored: StoredCart = JSON.parse(raw);

      if (Date.now() > stored.expiresAt) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return;
      }

      setItems(stored.items);
      setStoreIdState(stored.storeId ?? null);
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  /* =======================
     SAVE CART
  ======================= */
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (items.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    const payload: StoredCart = {
      storeId,
      items,
      expiresAt: Date.now() + CART_TTL_MS,
    };

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(payload)
    );
  }, [items, storeId]);

  /* =======================
     ACTIONS
  ======================= */
  function setStoreId(id: string) {
    setStoreIdState((current) => {
      // 🔒 evita trocar loja com carrinho ativo
      if (current && current !== id) {
        setItems([]);
      }
      return id;
    });
  }

  function addItem(item: CartItem) {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === item.id
      );

      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, qty: i.qty + item.qty }
            : i
        );
      }

      return [...prev, item];
    });
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, qty }
          : item
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
    setStoreIdState(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
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
        storeId,
        setStoreId,

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
