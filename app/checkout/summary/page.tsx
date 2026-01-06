"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/src/contexts/CartContext";

/* ================= TYPES ================= */
type PaymentMethod = "pix" | "credit" | "debit" | "cash";

export default function CheckoutSummaryPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const {
    items,
    storeId,
    checkoutData,
    clearCart,
  } = useCart();

  /* ================= VALIDACOES ================= */
  if (!storeId || !checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Erro interno: loja ou cliente não identificados
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Seu carrinho está vazio
      </div>
    );
  }

  /* ================= VALORES ================= */
  const subtotal = items.reduce(
    (acc, item) => acc + item.unitPrice * item.qty,
    0
  );

  const deliveryFee =
    checkoutData.deliveryType === "delivery"
      ? checkoutData.address?.fee ?? 0
      : 0;

  const discount = 0;
  const finalTotal = subtotal + deliveryFee - discount;

  /* ================= PAGAMENTO ================= */
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod | null>(null);

  const [needChange, setNeedChange] = useState(false);
  const [changeFor, setChangeFor] = useState("");

  /* ================= CUPOM ================= */
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  function applyCoupon() {
    if (!coupon) return;
    setCouponApplied(true);
  }

  /* ================= FINALIZAR PEDIDO ================= */
  async function handleFinishOrder() {
    if (!paymentMethod) {
      alert("Selecione a forma de pagamento");
      return;
    }

    if (paymentMethod === "cash" && needChange && !changeFor) {
      alert("Informe o valor do troco");
      return;
    }

    const payload = {
      storeId,
      customer: {
        name: checkoutData.customerName,
        phone: checkoutData.customerPhone,
      },
      deliveryType: checkoutData.deliveryType,
      address:
        checkoutData.deliveryType === "delivery"
          ? checkoutData.address
          : null,
      paymentMethod,
      deliveryFee,
      total: finalTotal,
      needChange,
      changeFor: needChange ? changeFor : null,
      coupon: couponApplied ? coupon : null,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
        unitPrice: item.unitPrice,
        complements: item.complements ?? [],
        observation: item.observation ?? "",
      })),
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("BACKEND ERROR:", text);
        throw new Error("Erro ao criar pedido");
      }

      const order = await res.json();

      clearCart();
      router.push(`/checkout/success?order=${order.id}`);
    } catch (err) {
      console.error(err);
      alert("Erro ao finalizar pedido. Tente novamente.");
    }
  }

  /* ================= RENDER ================= */
  return (
    <div className="max-w-xl mx-auto min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <div className="flex items-center gap-3 px-6 py-5 border-b">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border flex items-center justify-center"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold">Revisão do pedido</h1>
      </div>

      <div className="flex-1 px-6 py-6 space-y-6">
        {/* RESUMO */}
        <div className="border rounded-lg p-4 space-y-2">
          <h2 className="font-semibold mb-2">Resumo</h2>

          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>

          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span>Taxa de entrega</span>
              <span>R$ {deliveryFee.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold border-t pt-2 mt-2">
            <span>Total</span>
            <span>R$ {finalTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* CUPOM */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Cupom</h2>

          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Código do cupom"
              className="flex-1 border rounded px-3 py-2"
              disabled={couponApplied}
            />
            <button
              onClick={applyCoupon}
              disabled={couponApplied}
              className="bg-green-600 text-white px-4 rounded"
            >
              Aplicar
            </button>
          </div>
        </div>

        {/* PAGAMENTO */}
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Forma de pagamento</h2>

          {[
            { id: "pix", label: "Pix" },
            { id: "credit", label: "Cartão de crédito" },
            { id: "debit", label: "Cartão de débito" },
            { id: "cash", label: "Dinheiro" },
          ].map((opt) => (
            <label
              key={opt.id}
              className="flex items-center gap-3 text-sm cursor-pointer"
            >
              <input
                type="radio"
                checked={paymentMethod === opt.id}
                onChange={() =>
                  setPaymentMethod(opt.id as PaymentMethod)
                }
                className="accent-green-600"
              />
              {opt.label}
            </label>
          ))}

          {paymentMethod === "cash" && (
            <div className="mt-3 space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={needChange}
                  onChange={(e) =>
                    setNeedChange(e.target.checked)
                  }
                />
                Precisa de troco?
              </label>

              {needChange && (
                <input
                  value={changeFor}
                  onChange={(e) =>
                    setChangeFor(e.target.value)
                  }
                  placeholder="Troco para quanto?"
                  className="w-full border rounded px-3 py-2"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* FINALIZAR */}
      <div className="p-4 border-t">
        <button
          onClick={handleFinishOrder}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold"
        >
          Finalizar pedido
        </button>
      </div>
    </div>
  );
}
