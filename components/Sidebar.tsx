'use client';

import { useState } from 'react';
import {
  Home,
  BarChart2,
  Headphones,
  CreditCard,
  Tag,
  Star,
  Wallet,
  Settings,
  Users,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  LogOut,
  ChevronLeft
} from 'lucide-react';

import { useRouter } from "next/navigation";

export default function Sidebar() {

  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);

  const [open, setOpen] = useState({
    relatorios: false,
    atendimento: false,
    cupons: false,
    fidelizacao: false,
    trafego: false,
    admin: false,
    financeiro: false,
    integracoes: false,
    tutoriais: false,
  });

  function toggle(section: string) {
    setOpen(prev => ({ ...prev, [section]: !prev[section] }));
  }

  return (
    <aside className={`${collapsed ? "w-20" : "w-64"} 
      bg-white border-r h-screen p-4 flex flex-col gap-3 transition-all duration-300`}>

      {/* TOPO */}
      <div className="flex items-center justify-between mb-4 px-2">
        {!collapsed && <span className="font-bold text-xl text-red-600">TIFRA</span>}
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* ====== MENU ====== */}

      {/* Início */}
      <SidebarItem
        icon={<Home size={18} />}
        label="Início"
        collapsed={collapsed}
        noDropdown
        onClick={() => router.push('/panel/dashboard')}
      />

      {/* Gestor de Pedidos */}
      <SidebarItem
        icon={<Headphones size={18} />}
        label="Gestor de pedidos"
        collapsed={collapsed}
        noDropdown
        onClick={() => router.push('/panel/orders')}
      />

      {/* Clientes */}
      <SidebarItem
        icon={<Users size={18} />}
        label="Clientes"
        collapsed={collapsed}
        noDropdown
        onClick={() => router.push('/clientes')}
      />

      {/* Relatórios */}
      <SidebarItem
        icon={<BarChart2 size={18} />}
        label="Relatórios"
        collapsed={collapsed}
        open={open.relatorios}
        onClick={() => toggle("relatorios")}
      />

      {/* Cardápio — AGORA LINK DIRETO */}
      <SidebarItem
        icon={<CreditCard size={18} />}
        label="Cardápio"
        collapsed={collapsed}
        noDropdown
        onClick={() => router.push('/panel/cardapio')}
      />

      {/* Cupons */}
      <SidebarItem
        icon={<Tag size={18} />}
        label="Cupons"
        collapsed={collapsed}
        open={open.cupons}
        onClick={() => toggle("cupons")}
      />

      {/* Fidelização */}
      <SidebarItem
        icon={<Star size={18} />}
        label="Disparos e Fidelização"
        collapsed={collapsed}
        open={open.fidelizacao}
        onClick={() => toggle("fidelizacao")}
      />

      {/* Tráfego Pago */}
      <SidebarItem
        icon={<Wallet size={18} />}
        label="Tráfego Pago"
        collapsed={collapsed}
        open={open.trafego}
        onClick={() => toggle("trafego")}
      />

      {/* Administrar Loja */}
      <SidebarItem
        icon={<Settings size={18} />}
        label="Administrar Loja"
        collapsed={collapsed}
        open={open.admin}
        onClick={() => toggle("admin")}
      />

      {/* Financeiro */}
      <SidebarItem
        icon={<CreditCard size={18} />}
        label="Financeiro"
        collapsed={collapsed}
        open={open.financeiro}
        onClick={() => toggle("financeiro")}
      />

      {/* Integrações */}
      <SidebarItem
        icon={<Settings size={18} />}
        label="Integrações"
        collapsed={collapsed}
        open={open.integracoes}
        onClick={() => toggle("integracoes")}
      />

      {/* Tutoriais */}
      <SidebarItem
        icon={<HelpCircle size={18} />}
        label="Tutoriais / Crescer 🚀🔥"
        collapsed={collapsed}
        open={open.tutoriais}
        onClick={() => toggle("tutoriais")}
      />

      {/* RODAPÉ */}
      <div className="mt-auto pt-4 border-t">
        <SidebarItem
          icon={<LogOut size={18} />}
          label="Sair"
          collapsed={collapsed}
          noDropdown
        />
      </div>
    </aside>
  );
}


/* ----------------- COMPONENTE DO ITEM ----------------- */

function SidebarItem({
  icon,
  label,
  collapsed,
  open,
  onClick,
  noDropdown
}: any) {
  return (
    <div>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-2 py-2 text-left hover:bg-gray-100 rounded-md"
      >
        <div className="flex items-center gap-3">
          {icon}
          {!collapsed && <span className="text-sm">{label}</span>}
        </div>

        {!collapsed && !noDropdown && (
          open ?
            <ChevronDown size={18} className="text-gray-600" /> :
            <ChevronRight size={18} className="text-gray-600" />
        )}
      </button>

      {/* SUB ITENS (somente se tiver dropdown) */}
      {!collapsed && open && !noDropdown && (
        <div className="ml-8 mt-1 text-sm text-gray-500">
          <p>Opção 1</p>
          <p>Opção 2</p>
        </div>
      )}
    </div>
  );
}
