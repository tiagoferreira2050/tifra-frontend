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

export type CheckoutData = {
  customerName: string;
  customerPhone: string;
  deliveryType: "delivery" | "pickup" | "local";
  address?: any;
};

type StoredCart = {
  storeId: string | null;
  items: CartItem[];
  checkoutData: CheckoutData | null;
  expiresAt: number;
};

type CartContextType = {
  /* STORE */
  storeId: string | null;
  setStoreId: (id: string) => void;

  /* CART */
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;

  /* CHECKOUT */
  checkoutData: CheckoutData | null;
  setCheckoutData: (data: CheckoutData) => void;
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
  const [checkoutData, setCheckoutDataState] =
    useState<CheckoutData | null>(null);

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

      setItems(stored.items ?? []);
      setStoreIdState(stored.storeId ?? null);
      setCheckoutDataState(stored.checkoutData ?? null);
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
      checkoutData,
      expiresAt: Date.now() + CART_TTL_MS,
    };

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(payload)
    );
  }, [items, storeId, checkoutData]);

  /* =======================
     ACTIONS
  ======================= */
  function setStoreId(id: string) {
    setStoreIdState((current) => {
      // 🔒 evita trocar loja com carrinho ativo
      if (current && current !== id) {
        setItems([]);
        setCheckoutDataState(null);
      }
      return id;
    });
  }

  function setCheckoutData(data: CheckoutData) {
    setCheckoutDataState(data);
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
    setCheckoutDataState(null);
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

        checkoutData,
        setCheckoutData,
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
