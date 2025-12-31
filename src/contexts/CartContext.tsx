"use client";

import { createContext, useContext, useState } from "react";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  qty: number;
  unitPrice: number; // preço unitário correto
  complements?: Record<string, Record<string, number>>;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  total: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

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
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const total = items.reduce(
    (acc, item) => acc + item.unitPrice * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQty, removeItem, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve estar dentro do CartProvider");
  return ctx;
}
