"use client";

import React, { useState, useEffect } from "react";
import OrderColumn from "./OrderColumn";
import { apiFetch } from "@/lib/api"; // ✅ PADRÃO BACKEND EXPRESS

type Order = {
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

export default function OrderBoard({
  searchTerm = "",
  externalOrders = [],
}: {
  searchTerm?: string;
  externalOrders?: Order[];
}) {
  const [dbOrders, setDbOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // =====================================================
  // 🔥 CARREGAR PEDIDOS REAIS DO BACKEND (EXPRESS)
  // =====================================================
  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await apiFetch("/orders", {
          method: "GET",
        });

        setDbOrders(data || []);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
      }
    }

    loadOrders();
  }, []);

  // =====================================================
  // 🔥 MERGE ENTRE PEDIDOS DO BANCO E NOVOS (PDV)
  // =====================================================
  useEffect(() => {
    setOrders([...(externalOrders || []), ...dbOrders]);
  }, [externalOrders, dbOrders]);

  // =====================================================
  // 🔥 FILTRO DE BUSCA (MANTIDO)
  // =====================================================
  const [multiSelected, setMultiSelected] = useState<Record<string, boolean>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
  // 🔥 AÇÕES LOCAIS (SEM BACKEND AINDA – OK)
  // =====================================================
  function toggleSelect(id: string) {
    setMultiSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function accept(id: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "preparing" } : o))
    );
  }

  function reject(id: string) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  function dispatchOrder(id: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "delivering" } : o))
    );
  }

  function finishOrder(id: string) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "finished" } : o))
    );
  }

  const sumFinished = filteredOrders
    .filter((o) => o.status === "finished")
    .reduce((acc, o) => acc + (o.total || 0), 0);

  // =====================================================
  // 🔥 RENDER
  // =====================================================
  return (
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
        onOpen={(o) => setSelectedOrder(o)}
      />

      <OrderColumn
        title="Em Preparo"
        color="border-gray-300"
        count={filteredOrders.filter((o) => o.status === "preparing").length}
        orders={filteredOrders.filter((o) => o.status === "preparing")}
        onDispatch={dispatchOrder}
        onToggleSelect={toggleSelect}
        multiSelected={multiSelected}
        onOpen={(o) => setSelectedOrder(o)}
      />

      <OrderColumn
        title="Em Entrega"
        color="border-gray-300"
        count={filteredOrders.filter((o) => o.status === "delivering").length}
        orders={filteredOrders.filter((o) => o.status === "delivering")}
        onFinish={finishOrder}
        onToggleSelect={toggleSelect}
        multiSelected={multiSelected}
        onOpen={(o) => setSelectedOrder(o)}
      />

      <OrderColumn
        title="Concluídos"
        color="border-green-600"
        count={filteredOrders.filter((o) => o.status === "finished").length}
        orders={filteredOrders.filter((o) => o.status === "finished")}
        footerValue={sumFinished}
        onToggleSelect={toggleSelect}
        multiSelected={multiSelected}
        onOpen={(o) => setSelectedOrder(o)}
      />
    </div>
  );
}
