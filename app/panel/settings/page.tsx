"use client";

import { useRouter } from "next/navigation";
import { Globe, Store, ArrowRight } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Configurações
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Domínio da Loja
              </p>
              <p className="text-sm text-gray-600">
                Configure o endereço do seu site
              </p>
            </div>
          </div>

          <ArrowRight className="text-gray-400" />
        </button>

        {/* CONFIGURAÇÕES DA LOJA */}
        <button
          onClick={() => router.push("/panel/settings/store")}
          className="border rounded-xl p-5 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <Store size={22} />
            </div>

            <div className="text-left">
              <p className="font-semibold">
                Configurações da Loja
              </p>
              <p className="text-sm text-gray-600">
                Horário, taxa, pedido mínimo e status
              </p>
            </div>
          </div>

          <ArrowRight className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}
