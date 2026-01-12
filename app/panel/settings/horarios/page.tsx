"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { ArrowLeft, Save, Store, Clock, CalendarX, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type DayKey =
  | "seg"
  | "ter"
  | "qua"
  | "qui"
  | "sex"
  | "sab"
  | "dom";

interface DayConfig {
  label: string;
  open: string;
  close: string;
  enabled: boolean;
}

export default function HorariosPage() {
  const router = useRouter();

  const [storeOpen, setStoreOpen] = useState(true);

  const [days, setDays] = useState<Record<DayKey, DayConfig>>({
    seg: { label: "Segunda-feira", open: "08:00", close: "22:00", enabled: true },
    ter: { label: "Terça-feira", open: "08:00", close: "22:00", enabled: true },
    qua: { label: "Quarta-feira", open: "08:00", close: "22:00", enabled: true },
    qui: { label: "Quinta-feira", open: "08:00", close: "22:00", enabled: true },
    sex: { label: "Sexta-feira", open: "08:00", close: "23:00", enabled: true },
    sab: { label: "Sábado", open: "09:00", close: "23:00", enabled: true },
    dom: { label: "Domingo", open: "09:00", close: "18:00", enabled: false },
  });

  const toggleDay = (key: DayKey) => {
    setDays((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg border hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Horários</h1>
              <p className="text-sm text-muted-foreground">
                Configure o funcionamento
              </p>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white">
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>

        {/* STATUS DA LOJA */}
        <div className="border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold">
                Status da Loja{" "}
                <span className="ml-2 text-green-600 text-sm">
                  {storeOpen ? "Aberto" : "Fechado"}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                A loja está aceitando pedidos conforme os horários configurados
                abaixo.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStoreOpen(!storeOpen)}
            className={`w-12 h-6 rounded-full relative transition ${
              storeOpen ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
                storeOpen ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>

        {/* HORÁRIOS DE FUNCIONAMENTO */}
        <div className="border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="font-semibold">Horário de Funcionamento</h2>
              <p className="text-sm text-muted-foreground">
                Configure os horários de cada dia da semana
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(days).map(([key, day]) => (
              <div
                key={key}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">{day.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.enabled ? "Aberto" : "Fechado"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={day.open}
                    disabled={!day.enabled}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <span className="text-sm text-muted-foreground">às</span>
                  <input
                    type="time"
                    value={day.close}
                    disabled={!day.enabled}
                    className="border rounded px-2 py-1 text-sm"
                  />

                  <button
                    onClick={() => toggleDay(key as DayKey)}
                    className={`w-10 h-5 rounded-full relative transition ${
                      day.enabled ? "bg-black" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${
                        day.enabled ? "left-5" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAUSAS PROGRAMADAS */}
        <div className="border rounded-xl p-4 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarX className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="font-semibold">Pausas Programadas</h2>
              <p className="text-sm text-muted-foreground">
                Feriados, férias ou fechamentos especiais
              </p>
            </div>
          </div>

          {/* EXEMPLO DE PAUSA */}
          <div className="flex items-center justify-between bg-muted rounded-lg p-3">
            <div>
              <p className="font-medium">Natal e Ano Novo</p>
              <p className="text-sm text-muted-foreground">
                24 de dez até 26 de dez
              </p>
            </div>
            <button className="p-2 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* ADICIONAR PAUSA */}
          <div className="border border-dashed rounded-lg p-4 space-y-3">
            <input
              type="text"
              placeholder="Nome (ex: Férias, Feriado)"
              className="w-full border rounded px-3 py-2 text-sm"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                type="date"
                className="border rounded px-3 py-2 text-sm"
              />
            </div>

            <button className="w-full py-2 rounded-lg bg-black text-white flex items-center justify-center gap-2">
              + Adicionar Pausa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
