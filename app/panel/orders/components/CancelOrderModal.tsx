"use client";

import React, { useState } from "react";

const CANCEL_REASONS = [
  "Cliente desistiu",
  "Falta de item",
  "Endereço incorreto",
  "Problema no pagamento",
  "Erro no pedido",
  "Outros",
];

export default function CancelOrderModal({
  open,
  orderId,
  onClose,
  onConfirm,
}: {
  open: boolean;
  orderId: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  if (!open) return null;

  function handleConfirm() {
    const finalReason =
      reason === "Outros" ? customReason.trim() : reason;

    if (!finalReason) {
      alert("Selecione ou informe o motivo do cancelamento");
      return;
    }

    onConfirm(finalReason);
    setReason("");
    setCustomReason("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-[420px] shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-4">
          Motivo do cancelamento
        </h2>

        <div className="space-y-2 text-sm">
          {CANCEL_REASONS.map((r) => (
            <label
              key={r}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="cancelReason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
              />
              {r}
            </label>
          ))}
        </div>

        {reason === "Outros" && (
          <textarea
            className="w-full mt-3 border rounded p-2 text-sm"
            placeholder="Descreva o motivo"
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
          />
        )}

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 py-2 rounded"
          >
            Voltar
          </button>

          <button
            onClick={handleConfirm}
            className="flex-1 bg-red-600 text-white py-2 rounded"
          >
            Confirmar cancelamento
          </button>
        </div>
      </div>
    </div>
  );
}
