"use client";

import { useState, useTransition } from "react";

type DeliveryMode = "RADIUS" | "NEIGHBORHOOD";

interface Props {
  currentMode: DeliveryMode;
}

export default function DeliveryModeToggle({ currentMode }: Props) {
  const [mode, setMode] = useState<DeliveryMode>(currentMode);
  const [isPending, startTransition] = useTransition();

  function changeMode(value: DeliveryMode) {
    if (value === mode) return;

    setMode(value);

    startTransition(async () => {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/store/settings/delivery-mode`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ deliveryMode: value }),
          }
        );
      } catch (error) {
        console.error("Erro ao alterar modo de entrega", error);
      }
    });
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Modo de entrega</h2>

      <div className="flex gap-3">
        <button
          onClick={() => changeMode("RADIUS")}
          disabled={isPending}
          className={`px-4 py-2 rounded border transition ${
            mode === "RADIUS"
              ? "bg-black text-white"
              : "bg-white text-black"
          }`}
        >
          Por raio (km)
        </button>

        <button
          onClick={() => changeMode("NEIGHBORHOOD")}
          disabled={isPending}
          className={`px-4 py-2 rounded border transition ${
            mode === "NEIGHBORHOOD"
              ? "bg-black text-white"
              : "bg-white text-black"
          }`}
        >
          Por bairro
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Apenas um modo pode ficar ativo por vez.
      </p>
    </div>
  );
}
