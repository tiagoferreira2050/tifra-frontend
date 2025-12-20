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
  // 🔥 ESTADO PRINCIPAL
  // =====================================================
  const [orders, setOrders] = useState<Order[]>(externalOrders);
  const [lastOrderIds, setLastOrderIds] = useState<string[]>([]);
  const [multiSelected, setMultiSelected] = useState<Record<string, boolean>>(
    {}
  );

  // =====================================================
  // 🔄 SINCRONIZA COM O PAI (OrdersPage)
  // =====================================================
  useEffect(() => {
    setOrders(externalOrders);
  }, [externalOrders]);

  // =====================================================
  // 🔊 POLLING + SOM
  // =====================================================
  useEffect(() => {
    let interval: any;

    async function loadOrders() {
      try {
        const storeId = localStorage.getItem("storeId");
        if (!storeId) return;

        const data: Order[] = await apiFetch(
          `/orders?storeId=${storeId}`,
          { method: "GET" }
        );

        const currentIds = data.map((o) => o.id);

        const hasNewOrder = data.some(
          (o) =>
            o.status === "analysis" &&
            !lastOrderIds.includes(o.id)
        );

        if (hasNewOrder) {
          playNewOrderSound();
        }

        setOrders(data);
        setLastOrderIds(currentIds);
      } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
      }
    }

    loadOrders();
    interval = setInterval(loadOrders, 5000);

    return () => {
      clearInterval(interval);
      stopNewOrderSound();
    };
  }, [lastOrderIds]);

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
  // 🔥 AÇÕES
  // =====================================================
  function toggleSelect(id: string) {
    setMultiSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function accept(id: string) {
    stopNewOrderSound();
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "preparing" } : o
      )
    );
  }

  function reject(id: string) {
    stopNewOrderSound();
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  function dispatchOrder(id: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "delivering" } : o
      )
    );
  }

  function finishOrder(id: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "finished" } : o
      )
    );
  }

  const sumFinished = filteredOrders
    .filter((o) => o.status === "finished")
    .reduce((acc, o) => acc + (o.total || 0), 0);

  // =====================================================
  // 🖥️ RENDER
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
  );
}
