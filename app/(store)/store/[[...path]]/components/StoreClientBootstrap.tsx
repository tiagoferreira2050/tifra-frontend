"use client";

import { useEffect } from "react";
import { useCart } from "@/src/contexts/CartContext";

export default function StoreClientBootstrap({
  storeId,
}: {
  storeId: string;
}) {
  const { setStoreId } = useCart();

  useEffect(() => {
    if (storeId) {
      setStoreId(storeId);
    }
  }, [storeId, setStoreId]);

  return null;
}
