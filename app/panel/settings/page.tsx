"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Store,
  Truck,
  Clock,
  Globe,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-md p-2 hover:bg-gray-100 transition"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>

        <h1 className="text-2xl font-semibold text-gray-900">
          Configurações
        </h1>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MINHA LOJA */}
        <button
          onClick={() => router.push("/panel/settings/store")}
          className="group rounded-xl border bg-white p-5 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gray-100 p-3">
              <Store className="h-5 w-5 text-gray-700" />
            </div>

            <div className="text-left space-y-0.5">
              <p className="font-medium text-gray-900">
                Minha loja
              </p>
              <p className="text-sm text-gray-500">
                Nome, descrição, imagens e contato
              </p>
            </div>
          </div>

          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition" />
        </button>

        {/* HORÁRIOS */}
        <button
          onClick={() => router.push("/panel/settings/horarios")}
          className="group rounded-xl border bg-white p-5 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gray-100 p-3">
              <Clock className="h-5 w-5 text-gray-700" />
            </div>

            <div className="text-left space-y-0.5">
              <p className="font-medium text-gray-900">
                Horários
              </p>
              <p className="text-sm text-gray-500">
                Abertura, fechamento e status da loja
              </p>
            </div>
          </div>

          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition" />
        </button>

        {/* ENTREGA */}
        <button
          onClick={() => router.push("/panel/settings/entrega")}
          className="group rounded-xl border bg-white p-5 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gray-100 p-3">
              <Truck className="h-5 w-5 text-gray-700" />
            </div>

            <div className="text-left space-y-0.5">
              <p className="font-medium text-gray-900">
                Entrega
              </p>
              <p className="text-sm text-gray-500">
                Taxa, pedido mínimo e tempo estimado
              </p>
            </div>
          </div>

          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition" />
        </button>

        {/* DOMÍNIO */}
        <button
          onClick={() => router.push("/panel/settings/dominio")}
          className="group rounded-xl border bg-white p-5 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-gray-100 p-3">
              <Globe className="h-5 w-5 text-gray-700" />
            </div>

            <div className="text-left space-y-0.5">
              <p className="font-medium text-gray-900">
                Domínio da loja
              </p>
              <p className="text-sm text-gray-500">
                Configure o endereço do cardápio
              </p>
            </div>
          </div>

          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition" />
        </button>
      </div>
    </div>
  );
}
