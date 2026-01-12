"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  ArrowLeft,
  Save,
  Store,
  Clock,
  CalendarX,
  Trash2,
  Sun,
  Moon,
} from "lucide-react";
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
  short: string;
  open: string;
  close: string;
  enabled: boolean;
}

export default function HorariosPage() {
  const router = useRouter();
  const [storeOpen, setStoreOpen] = useState(true);

  const [days, setDays] = useState<Record<DayKey, DayConfig>>({
    seg: { label: "Segunda-feira", short: "Seg", open: "08:00", close: "22:00", enabled: true },
    ter: { label: "Terça-feira", short: "Ter", open: "08:00", close: "22:00", enabled: true },
    qua: { label: "Quarta-feira", short: "Qua", open: "08:00", close: "22:00", enabled: true },
    qui: { label: "Quinta-feira", short: "Qui", open: "08:00", close: "22:00", enabled: true },
    sex: { label: "Sexta-feira", short: "Sex", open: "08:00", close: "23:00", enabled: true },
    sab: { label: "Sábado", short: "Sáb", open: "09:00", close: "23:00", enabled: true },
    dom: { label: "Domingo", short: "Dom", open: "09:00", close: "18:00", enabled: false },
  });

  const toggleDay = (key: DayKey) => {
    setDays((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg border bg-white hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">Horários</h1>
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
        <div
          className={`rounded-xl border bg-white p-4 ${
            storeOpen
              ? "border-t-4 border-t-green-500"
              : "border-t-4 border-t-red-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  storeOpen ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Store
                  className={`w-5 h-5 ${
                    storeOpen ? "text-green-600" : "text-red-600"
                  }`}
                />
              </div>
              <div>
                <p className="font-medium">
                  Status da Loja{" "}
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      storeOpen
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {storeOpen ? "Aberto" : "Fechado"}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {storeOpen
                    ? "A loja está aceitando pedidos conforme os horários configurados abaixo."
                    : "A loja está fechada e não aceita pedidos no momento."}
                </p>
              </div>
            </div>

            {/* Toggle */}
            <button
              onClick={() => setStoreOpen(!storeOpen)}
              className={`w-11 h-6 rounded-full relative transition ${
                storeOpen ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
                  storeOpen ? "left-5" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* HORÁRIOS */}
        <div className="rounded-xl border bg-white p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="font-medium">Horário de Funcionamento</h2>
              <p className="text-sm text-muted-foreground">
                Configure os horários de cada dia da semana
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {Object.entries(days).map(([key, day]) => (
              <div
                key={key}
                className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                  day.enabled ? "bg-muted/30" : "bg-muted/10 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs rounded-md bg-muted font-medium">
                    {day.short}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{day.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {day.enabled ? "Aberto" : "Fechado"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {day.enabled && (
                    <>
                      <Sun className="w-4 h-4 text-orange-400" />
                      <input
                        type="time"
                        value={day.open}
                        className="border rounded-md px-2 py-1 text-sm bg-white"
                      />
                      <span className="text-xs text-muted-foreground">às</span>
                      <Moon className="w-4 h-4 text-blue-400" />
                      <input
                        type="time"
                        value={day.close}
                        className="border rounded-md px-2 py-1 text-sm bg-white"
                      />
                    </>
                  )}

                  <button
                    onClick={() => toggleDay(key as DayKey)}
                    className={`w-9 h-5 rounded-full relative transition ${
                      day.enabled ? "bg-black" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${
                        day.enabled ? "left-4.5" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAUSAS */}
        <div className="rounded-xl border bg-white p-4 space-y-4">
          <div className="flex items-center gap-2">
            <CalendarX className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="font-medium">Pausas Programadas</h2>
              <p className="text-sm text-muted-foreground">
                Feriados, férias ou fechamentos especiais
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-muted/40 rounded-lg p-3">
            <div>
              <p className="text-sm font-medium">Natal e Ano Novo</p>
              <p className="text-xs text-muted-foreground">
                24 de dez até 26 de dez
              </p>
            </div>
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 cursor-pointer" />
          </div>

          <div className="border border-dashed rounded-lg p-4 space-y-3">
            <input
              placeholder="Nome (ex: Férias, Feriado)"
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="border rounded-md px-3 py-2 text-sm" />
              <input type="date" className="border rounded-md px-3 py-2 text-sm" />
            </div>
            <button className="w-full py-2 rounded-lg bg-black text-white text-sm">
              + Adicionar Pausa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
