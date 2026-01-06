"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/src/contexts/CartContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

/* =======================
   TYPES
======================= */
type CartComplement = {
  optionId: string;
  optionName: string;
  qty: number;
};

export default function CartModal({ open, onClose }: Props) {
  const router = useRouter();
  const { items, updateQty, removeItem, total } = useCart();

  if (!open) return null;

  // 🔥 PEGA O SUBDOMÍNIO CORRETAMENTE
  let storeSlug: string | null = null;

  if (typeof window !== "undefined") {
    const host = window.location.hostname; // acaibrasil.tifra.com.br
    const parts = host.split(".");
    if (parts.length > 2) {
      storeSlug = parts[0]; // acaibrasil
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full sm:w-[420px] bg-white h-full flex flex-col">
        {/* HEADER */}
        <div className="p-4 border-b flex items-center justify-between">
          <button onClick={onClose} className="text-xl">
            ←
          </button>

          <h2 className="text-lg font-semibold">
            Sua sacola
          </h2>

          <span />
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">
              Sua sacola está vazia 🛒
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 border-b pb-4"
                >
                  {/* FOTO */}
                  <img
                    src={item.imageUrl || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                  />

                  {/* INFO */}
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>

                    {/* COMPLEMENTOS */}
                    {Array.isArray(item.complements) &&
                      item.complements.length > 0 && (
                        <div className="mt-1">
                          {(item.complements as CartComplement[]).map(
                            (c, i) => (
                              <p
                                key={i}
                                className="text-xs text-gray-500"
                              >
                                • {c.optionName}
                                {c.qty > 1 ? ` x${c.qty}` : ""}
                              </p>
                            )
                          )}
                        </div>
                      )}

                    {/* PREÇO */}
                    <p className="mt-2 font-semibold">
                      R$ {(item.unitPrice * item.qty)
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>
                  </div>

                  {/* AÇÕES */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400"
                    >
                      ✕
                    </button>

                    <div className="flex items-center gap-2 border rounded">
                      <button
                        onClick={() =>
                          updateQty(item.id, Math.max(1, item.qty - 1))
                        }
                        className="px-2"
                      >
                        −
                      </button>

                      <span>{item.qty}</span>

                      <button
                        onClick={() =>
                          updateQty(item.id, item.qty + 1)
                        }
                        className="px-2"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();

                if (storeSlug) {
                  router.push("/checkout"); 
                  // 👉 continua no MESMO subdomínio
                }
              }}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
