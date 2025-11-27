"use client";

import React, { useState, useEffect } from 'react';
import { getMockOrders, Order } from "../services/orderService";
import OrderColumn from "./OrderColumn";

export default function OrderBoard({ searchTerm = "", externalOrders = [] }) {

  // Pedidos iniciais (mock)
  const [internalOrders] = useState<Order[]>(getMockOrders());

  // Junta pedidos mock + pedidos criados no sistema
  const combinedOrders = [...externalOrders, ...internalOrders];

  // Estado usado para ações (aceitar, rejeitar, etc)
  const [orders, setOrders] = useState<Order[]>(combinedOrders);

  /* UPDATE quando novos pedidos vierem do Drawer */
  useEffect(() => {
    setOrders([...externalOrders, ...internalOrders]);
  }, [externalOrders, internalOrders]);

  const [multiSelected, setMultiSelected] = useState<Record<string, boolean>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  /* NORMALIZA TEXTO PARA BUSCA – SEGURO */
  function normalize(text: any) {
    if (!text) return "";
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  /* FILTRO REAL */
  const filteredOrders = orders.filter((o) => {
    const term = normalize(searchTerm);

    return (
      normalize(o.customer).includes(term) ||
      normalize(o.id).includes(term) ||
      normalize(o.phone).includes(term)
    );
  });

  /* AÇÕES (mantidas iguais) */
  function toggleSelect(id: string) {
    setMultiSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function accept(id: string) {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status: "preparing" } : o))
    );
  }

  function reject(id: string) {
    setOrders(prev => prev.filter(o => o.id !== id));
  }

  function dispatchOrder(id: string) {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status: "delivering" } : o))
    );
  }

  function finishOrder(id: string) {
    setOrders(prev =>
      prev.map(o => (o.id === id ? { ...o, status: "finished" } : o))
    );
  }

  /* SOMA FINALIZADOS */
  const sumFinished = filteredOrders
    .filter(o => o.status === "finished")
    .reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="grid grid-cols-4 gap-5 px-5">

      <OrderColumn
        title="Em Análise"
        color="border-gray-300"
        count={filteredOrders.filter(o => o.status === "analysis").length}
        orders={filteredOrders.filter(o => o.status === "analysis")}
        onAccept={accept}
        onReject={reject}
        onToggleSelect={toggleSelect}
        multiSelected={multiSelected}
        onOpen={(o) => setSelectedOrder(o)}
      />

      <OrderColumn
        title="Em Preparo"
        color="border-gray-300"
        count={filteredOrders.filter(o => o.status === "preparing").length}
        orders={filteredOrders.filter(o => o.status === "preparing")}
        onDispatch={dispatchOrder}
        onToggleSelect={toggleSelect}
        multiSelected={multiSelected}
        onOpen={(o) => setSelectedOrder(o)}
      />

      <OrderColumn
        title="Em Entrega"
        color="border-gray-300"
        count={filteredOrders.filter(o => o.status === "delivering").length}
        orders={filteredOrders.filter(o => o.status === "delivering")}
        onFinish={finishOrder}
        onToggleSelect={toggleSelect}
        multiSelected={multiSelected}
        onOpen={(o) => setSelectedOrder(o)}
      />

      <OrderColumn
        title="Concluídos"
        color="border-green-600"
        count={filteredOrders.filter(o => o.status === "finished").length}
        orders={filteredOrders.filter(o => o.status === "finished")}
        footerValue={sumFinished}
        onToggleSelect={toggleSelect}
        multiSelected={multiSelected}
        onOpen={(o) => setSelectedOrder(o)}
      />

    </div>
  );
}
