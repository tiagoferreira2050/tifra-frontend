"use client";

import { useState } from "react";
import NovoPedidoDrawer from "./components/NovoPedidoDrawer";
import OrderBoard from "./components/OrderBoard";
import { Plus } from "lucide-react";

/* 🔥 Mesmo tipo seguro usado nos outros arquivos de pedidos */
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

export default function OrdersPage() {
  const [openNovoPedido, setOpenNovoPedido] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]); // 🔥 tipado corretamente

  // Recebe pedido criado no Drawer
  function handleCreateOrder(newOrder: Order) {
    setOrders(prev => [newOrder, ...prev]);
  }

  return (
    <div className="p-4 w-full h-full">

      {/* HEADER PROFISSIONAL – ESTILO BRENDI */}
      <div className="w-full flex items-center justify-between bg-white border-b px-3 py-2 rounded-md shadow-sm mb-4">

        {/* CAMPO DE BUSCA */}
        <div className="flex items-center w-1/3">
          <input
            type="text"
            placeholder="Buscar pedido (nome, número ou telefone)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 px-3 py-1.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        {/* BOTÕES DO HEADER */}
        <div className="flex items-center gap-2">

          {/* PAUSAR LOJA */}
          <button className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 transition">
            🛑 Pausar loja
          </button>

          {/* BOTÃO NOVO PEDIDO */}
          <button 
            onClick={() => setOpenNovoPedido(true)}
            className="flex items-center gap-1 bg-red-600 px-4 py-1.5 rounded-md text-sm text-white hover:bg-red-700 transition shadow-sm"
          >
            <Plus size={16} />
            Novo pedido
          </button>

        </div>
      </div>

      {/* QUADROS DE PEDIDOS */}
      <OrderBoard 
        searchTerm={searchTerm}
        externalOrders={orders as any}    {/* ✅ prevenção contra never[] */}
      />

      {/* DRAWER DO NOVO PEDIDO */}
      <NovoPedidoDrawer 
        open={openNovoPedido}
        onClose={() => setOpenNovoPedido(false)}
        onCreate={handleCreateOrder}
      />

    </div>
  );
}
