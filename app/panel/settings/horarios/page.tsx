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
  Copy,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { getStoreStatus } from "@/lib/store-status";

/* ============================
   TYPES
============================ */
type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface ScheduledPause {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

/* ============================
   CONSTANTS
============================ */
const daysOfWeek: {
  key: DayKey;
  label: string;
  short: string;
}[] = [
  { key: "monday", label: "Segunda-feira", short: "Seg" },
  { key: "tuesday", label: "Terça-feira", short: "Ter" },
  { key: "wednesday", label: "Quarta-feira", short: "Qua" },
  { key: "thursday", label: "Quinta-feira", short: "Qui" },
  { key: "friday", label: "Sexta-feira", short: "Sex" },
  { key: "saturday", label: "Sábado", short: "Sáb" },
  { key: "sunday", label: "Domingo", short: "Dom" },
];

/* ============================
   PAGE
============================ */
export default function HorariosPage() {
  const router = useRouter();

  /* ---------- STATES ---------- */
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const [schedule, setSchedule] = useState<Record<DayKey, DaySchedule>>({
    monday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
    tuesday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
    wednesday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
    thursday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
    friday: { isOpen: true, openTime: "08:00", closeTime: "23:00" },
    saturday: { isOpen: true, openTime: "09:00", closeTime: "23:00" },
    sunday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
  });

  const [scheduledPauses, setScheduledPauses] = useState<ScheduledPause[]>([
    {
      id: "1",
      name: "Natal e Ano Novo",
      startDate: "2025-12-24",
      endDate: "2025-12-26",
    },
  ]);

  const [newPause, setNewPause] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  /* ---------- CORE STATUS ---------- */
  const storeStatus = getStoreStatus({
    isStoreOpen,
    schedule,
    pauses: scheduledPauses,
  });

  /* ---------- HELPERS ---------- */
  const toggleDay = (day: DayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
      },
    }));
  };

  const copyToAllDays = (sourceDay: DayKey) => {
    const base = schedule[sourceDay];
    const updated: Record<DayKey, DaySchedule> = {} as any;

    daysOfWeek.forEach((d) => {
      updated[d.key] = { ...base };
    });

    setSchedule(updated);
  };

  const addPause = () => {
    if (!newPause.name || !newPause.startDate || !newPause.endDate) return;

    setScheduledPauses((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        ...newPause,
      },
    ]);

    setNewPause({ name: "", startDate: "", endDate: "" });
  };

  const removePause = (id: string) => {
    setScheduledPauses((prev) => prev.filter((p) => p.id !== id));
  };

  /* ============================
     RENDER
  ============================ */
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
        <div className="rounded-xl border bg-white overflow-hidden">
          <div
            className={`h-1.5 ${
              storeStatus.status === "open"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          />

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  storeStatus.status === "open"
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                <Store
                  className={`w-6 h-6 ${
                    storeStatus.status === "open"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                />
              </div>

              <div>
                <p className="font-medium flex items-center gap-2">
                  Status da Loja
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      storeStatus.status === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {storeStatus.status === "open" ? "Aberto" : "Fechado"}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {storeStatus.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsStoreOpen(!isStoreOpen)}
              className={`w-11 h-6 rounded-full relative transition ${
                isStoreOpen ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${
                  isStoreOpen ? "left-5" : "left-1"
                }`}
              />
            </button>
          </div>

          <p className="px-4 pb-4 text-sm text-muted-foreground">
            {storeStatus.status === "open"
              ? "A loja está aceitando pedidos conforme os horários configurados abaixo."
              : "A loja está fechada e não aceita pedidos no momento."}
          </p>
        </div>

        {/* HORÁRIOS DA SEMANA */}
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
            {daysOfWeek.map((day) => {
              const d = schedule[day.key];

              return (
                <div
                  key={day.key}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                    d.isOpen ? "bg-muted/30" : "bg-muted/10 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 text-xs rounded-md bg-muted font-medium">
                      {day.short}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{day.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.isOpen ? "Aberto" : "Fechado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {d.isOpen && (
                      <>
                        <Sun className="w-4 h-4 text-orange-400" />
                        <input
                          type="time"
                          value={d.openTime}
                          className="border rounded-md px-2 py-1 text-sm bg-white"
                        />
                        <span className="text-xs text-muted-foreground">às</span>
                        <Moon className="w-4 h-4 text-blue-400" />
                        <input
                          type="time"
                          value={d.closeTime}
                          className="border rounded-md px-2 py-1 text-sm bg-white"
                        />
                        <button
                          onClick={() => copyToAllDays(day.key)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => toggleDay(day.key)}
                      className={`w-9 h-5 rounded-full relative transition ${
                        d.isOpen ? "bg-black" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${
                          d.isOpen ? "left-4.5" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              );
            })}
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

          {scheduledPauses.map((pause) => (
            <div
              key={pause.id}
              className="flex items-center justify-between bg-muted/40 rounded-lg p-3"
            >
              <div>
                <p className="text-sm font-medium">{pause.name}</p>
                <p className="text-xs text-muted-foreground">
                  {pause.startDate} até {pause.endDate}
                </p>
              </div>
              <button onClick={() => removePause(pause.id)}>
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
              </button>
            </div>
          ))}

          <div className="border border-dashed rounded-lg p-4 space-y-3">
            <input
              placeholder="Nome (ex: Férias, Feriado)"
              value={newPause.name}
              onChange={(e) =>
                setNewPause({ ...newPause, name: e.target.value })
              }
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={newPause.startDate}
                onChange={(e) =>
                  setNewPause({ ...newPause, startDate: e.target.value })
                }
                className="border rounded-md px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={newPause.endDate}
                onChange={(e) =>
                  setNewPause({ ...newPause, endDate: e.target.value })
                }
                className="border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <button
              onClick={addPause}
              className="w-full py-2 rounded-lg bg-black text-white text-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Pausa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
