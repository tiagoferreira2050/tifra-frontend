"use client";

import React, { useState, useEffect } from "react";
import OrderColumn from "./OrderColumn";
import OrderModal from "./OrderModal";
import { apiFetch } from "@/lib/api";
import { playNewOrderSound, stopNewOrderSound } from "@/lib/newOrderSound";

/* 🔒 Tipo único e consistente */
export type Order = {
  id: string;
  customer: string;
  status: string;
  total: number;
  phone?: string;
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
  const [multiSelected, setMultiSelected] = useState<Record<string, boolean>>({});
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  // 🔥 MODAL
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // =====================================================
  // 🔄 SINCRONIZA COM O PAI
  // =====================================================
  useEffect(() => {
    setOrders(externalOrders);
  }, [externalOrders]);

  // =====================================================
  // 🔁 FUNÇÃO CENTRAL (BACKEND = VERDADE)
  // =====================================================
  async function loadOrdersFromApi() {
    try {
      const storeId = localStorage.getItem("storeId");
      if (!storeId) return;

      const data: Order[] = await apiFetch(`/orders?storeId=${storeId}`);

      const hasPending = data.some((o) => o.status === "analysis");

      if (hasPending && soundEnabled) playNewOrderSound();
      if (!hasPending) stopNewOrderSound();

      setOrders(data);
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    }
  }

  // =====================================================
  // 🔊 POLLING DE SEGURANÇA
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
    return String(text || "")
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
  // 🔥 UPDATE DE STATUS (ÚNICO)
  // =====================================================
  async function updateOrderStatus(id: string, status: string) {
    if (loadingOrderId) return;

    setLoadingOrderId(id);

    try {
      await apiFetch(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      await loadOrdersFromApi();
    } catch (err) {
      console.error("Erro ao atualizar pedido:", err);
      alert("Erro ao atualizar pedido");
    } finally {
      setLoadingOrderId(null);
    }
  }

  // =====================================================
  // 🔥 AÇÕES
  // =====================================================
  function accept(id: string) {
    stopNewOrderSound();
    updateOrderStatus(id, "preparing");
  }

  function dispatchOrder(id: string) {
    updateOrderStatus(id, "delivering");
  }

  function finishOrder(id: string) {
    updateOrderStatus(id, "finished");
  }

  function reject(id: string) {
    updateOrderStatus(id, "canceled");
  }

  function toggleSelect(id: string) {
    setMultiSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const sumFinished = filteredOrders
  .filter((o) => o.status === "finished")
  .reduce((acc, o) => acc + (o.total || 0), 0);


  // =====================================================
  // 🔊 ATIVAR SOM
  // =====================================================
  function enableSound() {
    const audio = new Audio("/sounds/new-order.mp3");
    audio.volume = 0.3;

    audio
      .play()
      .then(() => setSoundEnabled(true))
      .catch(() => console.warn("Áudio bloqueado"));
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
          loadingOrderId={loadingOrderId}
          onOpen={(order) => setSelectedOrder(order)}
        />

        <OrderColumn
          title="Em Preparo"
          color="border-gray-300"
          count={filteredOrders.filter((o) => o.status === "preparing").length}
          orders={filteredOrders.filter((o) => o.status === "preparing")}
          onDispatch={dispatchOrder}
          onToggleSelect={toggleSelect}
          multiSelected={multiSelected}
          loadingOrderId={loadingOrderId}
          onOpen={(order) => setSelectedOrder(order)}
        />

        <OrderColumn
          title="Em Entrega"
          color="border-gray-300"
          count={filteredOrders.filter((o) => o.status === "delivering").length}
          orders={filteredOrders.filter((o) => o.status === "delivering")}
          onFinish={finishOrder}
          onToggleSelect={toggleSelect}
          multiSelected={multiSelected}
          loadingOrderId={loadingOrderId}
          onOpen={(order) => setSelectedOrder(order)}
        />

        <OrderColumn
          title="Concluídos"
          color="border-green-600"
          count={
  filteredOrders.filter(
    (o) => o.status === "finished" || o.status === "canceled"
  ).length
}
          orders={filteredOrders.filter(
  (o) => o.status === "finished" || o.status === "canceled"
)}

          footerValue={sumFinished}
          onToggleSelect={toggleSelect}
          multiSelected={multiSelected}
          loadingOrderId={loadingOrderId}
          onOpen={(order) => setSelectedOrder(order)}
        />
      </div>

      {/* 🔥 MODAL DO PEDIDO */}
      <OrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </>
  );
}
