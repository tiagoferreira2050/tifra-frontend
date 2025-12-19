"use client";

import { useState, useEffect } from "react";
import NovoPedidoDrawer from "./components/NovoPedidoDrawer";
import OrderBoard from "./components/OrderBoard";
import { Plus } from "lucide-react";
import { Order } from "./services/orderTypes";
import { apiFetch } from "@/lib/api";

export default function OrdersPage() {
  const [openNovoPedido, setOpenNovoPedido] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  // =========================================================
  // 🔥 CARREGAR PEDIDOS DO BANCO (OBRIGATÓRIO COM storeId)
  // =========================================================
  useEffect(() => {
    async function loadOrders() {
      try {
        const storeId = localStorage.getItem("storeId");

        // 🔒 Segurança: não busca pedidos sem loja
        if (!storeId) {
          console.error("storeId não encontrado");
          return;
        }

        const data = await apiFetch(`/orders?storeId=${storeId}`, {
          method: "GET",
        });

        setOrders(data || []);
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
      }
    }

    loadOrders();
  }, []);

  // =========================================================
  // 🔥 ADICIONAR NOVO PEDIDO NA LISTA LOCAL (PDV)
  // =========================================================
  function handleCreateOrder(newOrder: Order) {
    setOrders((prev) => [newOrder, ...prev]);
  }

  return (
    <div className="p-4 w-full h-full">
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}
      <div className="w-full flex items-center justify-between bg-white border-b px-3 py-2 rounded-md shadow-sm mb-4">
        
        {/* BUSCA */}
        <div className="flex items-center w-1/3">
          <input
            type="text"
            placeholder="Buscar pedido (nome, número ou telefone)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        {/* AÇÕES */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition">
            🛑 Pausar loja
          </button>

          <button
            onClick={() => setOpenNovoPedido(true)}
            className="flex items-center gap-1 bg-red-600 px-4 py-1.5 rounded-md text-sm text-white hover:bg-red-700 transition shadow-sm"
          >
            <Plus size={16} />
            Novo pedido
          </button>
        </div>
      </div>

      {/* ===================================================== */}
      {/* BOARD DE PEDIDOS */}
      {/* ===================================================== */}
      <OrderBoard
        searchTerm={searchTerm}
        externalOrders={orders}
      />

      {/* ===================================================== */}
      {/* DRAWER – NOVO PEDIDO */}
      {/* ===================================================== */}
      <NovoPedidoDrawer
        open={openNovoPedido}
        onClose={() => setOpenNovoPedido(false)}
        onCreate={handleCreateOrder}
      />
    </div>
  );
}
