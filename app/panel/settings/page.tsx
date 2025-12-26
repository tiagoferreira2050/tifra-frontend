"use client";

import { useRouter } from "next/navigation";
import {
  Globe,
  Store,
  Truck,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Configurações
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MINHA LOJA */}
        <button
          onClick={() => router.push("/panel/settings/store")}
          className="border rounded-xl p-5 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 text-gray-700 p-3 rounded-lg">
              <Store size={22} />
            </div>

            <div className="text-left">
              <p className="font-semibold">
                Minha loja
              </p>
              <p className="text-sm text-gray-600">
                Nome, descrição, imagens e contato
              </p>
            </div>
          </div>

          <ArrowRight className="text-gray-400" />
        </button>

        {/* HORÁRIOS */}
        <button
          onClick={() => router.push("/panel/settings/horarios")}
          className="border rounded-xl p-5 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 text-yellow-700 p-3 rounded-lg">
              <Clock size={22} />
            </div>

            <div className="text-left">
              <p className="font-semibold">
                Horários
              </p>
              <p className="text-sm text-gray-600">
                Abertura, fechamento e status da loja
              </p>
            </div>
          </div>

          <ArrowRight className="text-gray-400" />
        </button>

        {/* ENTREGA */}
        <button
          onClick={() => router.push("/panel/settings/entrega")}
          className="border rounded-xl p-5 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 text-green-700 p-3 rounded-lg">
              <Truck size={22} />
            </div>

            <div className="text-left">
              <p className="font-semibold">
                Entrega
              </p>
              <p className="text-sm text-gray-600">
                Taxa, pedido mínimo e tempo estimado
              </p>
            </div>
          </div>

          <ArrowRight className="text-gray-400" />
        </button>

        {/* DOMÍNIO */}
        <button
          onClick={() => router.push("/panel/settings/dominio")}
          className="border rounded-xl p-5 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-100 text-red-600 p-3 rounded-lg">
              <Globe size={22} />
            </div>

            <div className="text-left">
              <p className="font-semibold">
                Domínio da loja
              </p>
              <p className="text-sm text-gray-600">
                Configure o endereço do cardápio
              </p>
            </div>
          </div>

          <ArrowRight className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
