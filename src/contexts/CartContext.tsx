"use client";

import { createContext, useContext, useState } from "react";

type CartItem = {
  id: string;
  productId: string;
  name: string;
  qty: number;
  price: number;
  complements?: any[];
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(item: CartItem) {
    setItems((prev) => [...prev, item]);
  }

  return (
    <CartContext.Provider value={{ items, addItem }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve estar dentro do CartProvider");
  return ctx;
}
