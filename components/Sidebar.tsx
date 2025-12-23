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
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-64"}
      bg-white border-r h-screen p-4 flex flex-col gap-3 transition-all duration-300`}
    >
      {/* TOP */}
      <div className="flex items-center justify-between mb-4 px-2">
        {!collapsed && (
          <span className="font-bold text-xl text-red-600">
            TIFRA
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          {collapsed
            ? <ChevronRight className="w-5 h-5" />
            : <ChevronLeft className="w-5 h-5" />
          }
        </button>
      </div>

      {/* MENU */}
      <SidebarItem
        icon={<Home size={18} />}
        label="Início"
        collapsed={collapsed}
        onClick={() => router.push('/panel/dashboard')}
      />

      <SidebarItem
        icon={<Headphones size={18} />}
        label="Gestor de pedidos"
        collapsed={collapsed}
        onClick={() => router.push('/panel/orders')}
      />

      <SidebarItem
        icon={<Users size={18} />}
        label="Clientes"
        collapsed={collapsed}
        onClick={() => router.push('/clientes')}
      />

      <SidebarItem
        icon={<BarChart2 size={18} />}
        label="Relatórios"
        collapsed={collapsed}
        onClick={() => router.push('/panel/reports')}
      />

      <SidebarItem
        icon={<CreditCard size={18} />}
        label="Cardápio"
        collapsed={collapsed}
        onClick={() => router.push('/panel/cardapio')}
      />

      <SidebarItem
        icon={<Tag size={18} />}
        label="Cupons"
        collapsed={collapsed}
        onClick={() => router.push('/panel/cupons')}
      />

      <SidebarItem
        icon={<Star size={18} />}
        label="Disparos e Fidelização"
        collapsed={collapsed}
        onClick={() => router.push('/panel/fidelizacao')}
      />

      <SidebarItem
        icon={<Wallet size={18} />}
        label="Tráfego Pago"
        collapsed={collapsed}
        onClick={() => router.push('/panel/trafego')}
      />

      {/* 🔥 CONFIGURAÇÃO (ROTA CORRETA) */}
      <SidebarItem
        icon={<Settings size={18} />}
        label="Configuração"
        collapsed={collapsed}
        onClick={() => router.push('/panel/settings')}
      />

      <SidebarItem
        icon={<CreditCard size={18} />}
        label="Financeiro"
        collapsed={collapsed}
        onClick={() => router.push('/panel/financeiro')}
      />

      <SidebarItem
        icon={<Settings size={18} />}
        label="Integrações"
        collapsed={collapsed}
        onClick={() => router.push('/panel/integracoes')}
      />

      <SidebarItem
        icon={<HelpCircle size={18} />}
        label="Tutoriais / Crescer 🚀🔥"
        collapsed={collapsed}
        onClick={() => router.push('/panel/tutoriais')}
      />

      {/* SAIR */}
      <div className="mt-auto pt-4 border-t">
        <SidebarItem
          icon={<LogOut size={18} />}
          label="Sair"
          collapsed={collapsed}
          onClick={() => {
            localStorage.clear();
            router.push('/login');
          }}
        />
      </div>
    </aside>
  );
}

/* ITEM DO SIDEBAR */
function SidebarItem({
  icon,
  label,
  collapsed,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-gray-100 rounded-md"
    >
      {icon}
      {!collapsed && (
        <span className="text-sm">{label}</span>
      )}
    </button>
  );
}
