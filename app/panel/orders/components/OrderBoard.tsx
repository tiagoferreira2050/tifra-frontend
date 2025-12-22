"use client";

import React, { useState, useEffect } from "react";
import OrderColumn from "./OrderColumn";
import { apiFetch } from "@/lib/api";
import { playNewOrderSound, stopNewOrderSound } from "@/lib/newOrderSound";

/* 🔒 Tipo único e consistente */
export type Order = {
  id: string;
  customer: string;
  status: string;
  total: number;
  phone?: string;
  deliveryType?: string;
  address?: string;
  shortAddress?: string;
  createdAt: string;
  items?: any[];
  paymentMethod?: string;
  deliveryFee?: number;
};

interface Props {
  searchTerm?: string;
  externalOrders?: Order[];
}

export default function OrderBoard({
  searchTerm = "",
  externalOrders = [],
}: Props) {
  // =====================================================
  // 🔥 ESTADOS
  // =====================================================
  const [orders, setOrders] = useState<Order[]>(externalOrders);
  const [multiSelected, setMultiSelected] = useState<Record<string, boolean>>(
    {}
  );
  const [soundEnabled, setSoundEnabled] = useState(false);

  // =====================================================
  // 🔄 SINCRONIZA COM O PAI
  // =====================================================
  useEffect(() => {
    setOrders(externalOrders);
  }, [externalOrders]);

  // =====================================================
  // 🔁 FUNÇÃO CENTRAL DE REFETCH (FONTE DA VERDADE)
  // =====================================================
  async function loadOrdersFromApi() {
    try {
      const storeId = localStorage.getItem("storeId");
      if (!storeId) return;

      const data: Order[] = await apiFetch(
        `/orders?storeId=${storeId}`,
        { method: "GET" }
      );

      const hasPending = data.some((o) => o.status === "analysis");

      if (hasPending && soundEnabled) {
        playNewOrderSound();
      }

      if (!hasPending) {
        stopNewOrderSound();
      }

      setOrders(data);
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    }
  }

  // =====================================================
  // 🔊 POLLING (SEGURANÇA)
  // =====================================================
  useEffect(() => {
    loadOrdersFromApi();
    const interval = setInterval(loadOrdersFromApi, 5000);

    return () => {
      clearInterval(interval);
      stopNewOrderSound();
    };
  }, [soundEnabled]);

  // =====================================================
  // 🔍 FILTRO
  // =====================================================
  function normalize(text: any) {
    if (!text) return "";
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  const filteredOrders = orders.filter((o) => {
    const term = normalize(searchTerm);
    return (
      normalize(o.customer).includes(term) ||
      normalize(o.id).includes(term) ||
      normalize(o.phone ?? "").includes(term)
    );
  });

  // =====================================================
  // 🔥 AÇÕES (SALVA NO BACKEND + REFRESH IMEDIATO)
  // =====================================================
  function toggleSelect(id: string) {
    setMultiSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function accept(id: string) {
    stopNewOrderSound();

    await apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "preparing" }),
    });

    await loadOrdersFromApi(); // ⚡ resposta imediata
  }

  async function reject(id: string) {
    stopNewOrderSound();

    await apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "finished" }),
    });

    await loadOrdersFromApi();
  }

  async function dispatchOrder(id: string) {
    await apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "delivering" }),
    });

    await loadOrdersFromApi();
  }

  async function finishOrder(id: string) {
    await apiFetch(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "finished" }),
    });

    await loadOrdersFromApi();
  }

  const sumFinished = filteredOrders
    .filter((o) => o.status === "finished")
    .reduce((acc, o) => acc + (o.total || 0), 0);

  // =====================================================
  // 🔊 ATIVAR SOM (INTERAÇÃO DO USUÁRIO)
  // =====================================================
  function enableSound() {
    const audio = new Audio("/sounds/new-order.mp3");
    audio.volume = 0.3;

    audio
      .play()
      .then(() => {
        setSoundEnabled(true);
      })
      .catch((err) => {
        console.error("❌ Chrome bloqueou o áudio:", err);
      });
  }

  // =====================================================
  // 🖥️ RENDER
  // =====================================================
  return (
    <>
      {!soundEnabled && (
        <button
          onClick={enableSound}
          className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded z-50"
        >
          Ativar som 🔊
        </button>
      )}

      <div className="grid grid-cols-4 gap-5 px-5">
        <OrderColumn
          title="Em Análise"
          color="border-gray-300"
          count={filteredOrders.filter((o) => o.status === "analysis").length}
          orders={filteredOrders.filter((o) => o.status === "analysis")}
          onAccept={accept}
          onReject={reject}
          onToggleSelect={toggleSelect}
          multiSelected={multiSelected}
          onOpen={() => {}}
        />

        <OrderColumn
          title="Em Preparo"
          color="border-gray-300"
          count={filteredOrders.filter((o) => o.status === "preparing").length}
          orders={filteredOrders.filter((o) => o.status === "preparing")}
          onDispatch={dispatchOrder}
          onToggleSelect={toggleSelect}
          multiSelected={multiSelected}
          onOpen={() => {}}
        />

        <OrderColumn
          title="Em Entrega"
          color="border-gray-300"
          count={filteredOrders.filter((o) => o.status === "delivering").length}
          orders={filteredOrders.filter((o) => o.status === "delivering")}
          onFinish={finishOrder}
          onToggleSelect={toggleSelect}
          multiSelected={multiSelected}
          onOpen={() => {}}
        />

        <OrderColumn
          title="Concluídos"
          color="border-green-600"
          count={filteredOrders.filter((o) => o.status === "finished").length}
          orders={filteredOrders.filter((o) => o.status === "finished")}
          footerValue={sumFinished}
          onToggleSelect={toggleSelect}
          multiSelected={multiSelected}
          onOpen={() => {}}
        />
      </div>
    </>
  );
}
