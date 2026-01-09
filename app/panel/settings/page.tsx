"use client";

import { useRouter } from "next/navigation";
import {
  Store,
  Truck,
  Clock,
  Globe,
  MapPin,
  ChevronRight,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Configurações
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* MINHA LOJA */}
          <button
            onClick={() => router.push("/panel/settings/store")}
            className="group w-full rounded-xl border border-gray-200 bg-white p-6 flex items-center justify-between transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <Store className="h-6 w-6 text-emerald-600" />
              </div>

              <div className="text-left">
                <p className="font-semibold text-gray-900">
                  Minha loja
                </p>
                <p className="text-sm text-gray-500">
                  Nome, descrição, imagens e contato
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition" />
          </button>

          {/* HORÁRIOS */}
          <button
            onClick={() => router.push("/panel/settings/horarios")}
            className="group w-full rounded-xl border border-gray-200 bg-white p-6 flex items-center justify-between transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>

              <div className="text-left">
                <p className="font-semibold text-gray-900">
                  Horários
                </p>
                <p className="text-sm text-gray-500">
                  Abertura, fechamento e status da loja
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition" />
          </button>

          {/* ENTREGA */}
          <button
            onClick={() => router.push("/panel/settings/entrega")}
            className="group w-full rounded-xl border border-gray-200 bg-white p-6 flex items-center justify-between transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>

              <div className="text-left">
                <p className="font-semibold text-gray-900">
                  Entrega
                </p>
                <p className="text-sm text-gray-500">
                  Taxa, pedido mínimo e tempo estimado
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition" />
          </button>

          {/* ENDEREÇO */}
          <button
            onClick={() => router.push("/panel/settings/endereco")}
            className="group w-full rounded-xl border border-gray-200 bg-white p-6 flex items-center justify-between transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>

              <div className="text-left">
                <p className="font-semibold text-gray-900">
                  Endereço
                </p>
                <p className="text-sm text-gray-500">
                  Localização do seu estabelecimento
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition" />
          </button>

          {/* DOMÍNIO */}
          <button
            onClick={() => router.push("/panel/settings/dominio")}
            className="group w-full rounded-xl border border-gray-200 bg-white p-6 flex items-center justify-between transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                <Globe className="h-6 w-6 text-red-600" />
              </div>

              <div className="text-left">
                <p className="font-semibold text-gray-900">
                  Domínio da loja
                </p>
                <p className="text-sm text-gray-500">
                  Configure o endereço do cardápio
                </p>
              </div>
            </div>

            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition" />
          </button>
        </div>
      </div>
    </div>
  );
}
