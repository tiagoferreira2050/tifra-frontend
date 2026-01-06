"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* ================= TYPES ================= */
type PaymentMethod = "pix" | "credit" | "debit" | "cash";

export default function CheckoutSummaryPage() {
  const router = useRouter();

  /* ================= MOCK (POR ENQUANTO) ================= */
  const subtotal = 49.9; // depois vem do carrinho
  const deliveryFee = 4.99;
  const discount = 0;

  const total = subtotal + deliveryFee - discount;

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
    // 🔥 depois valida no backend
    setCouponApplied(true);
  }

  /* ================= FINALIZAR ================= */
  function handleFinishOrder() {
    if (!paymentMethod) {
      alert("Selecione a forma de pagamento");
      return;
    }

    if (paymentMethod === "cash" && needChange && !changeFor) {
      alert("Informe o valor do troco");
      return;
    }

    // 🔥 depois cria pedido no backend
    alert("Pedido finalizado com sucesso 🚀");

    router.push("/checkout/success");
  }

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

          <div className="flex justify-between text-sm">
            <span>Taxa de entrega</span>
            <span>R$ {deliveryFee.toFixed(2)}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Desconto</span>
              <span>- R$ {discount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold border-t pt-2 mt-2">
            <span>Total</span>
            <span>R$ {total.toFixed(2)}</span>
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

          {couponApplied && (
            <p className="text-sm text-green-600">
              Cupom aplicado com sucesso
            </p>
          )}
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

          {/* TROCO */}
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
