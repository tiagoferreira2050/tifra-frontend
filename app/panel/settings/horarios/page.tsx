"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Sun,
  Moon,
  Copy,
  Store,
  Clock,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type DaySchedule = {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type WeekSchedule = Record<string, DaySchedule>;

const daysOfWeek = [
  { key: "monday", label: "Segunda-feira", short: "Seg" },
  { key: "tuesday", label: "Terça-feira", short: "Ter" },
  { key: "wednesday", label: "Quarta-feira", short: "Qua" },
  { key: "thursday", label: "Quinta-feira", short: "Qui" },
  { key: "friday", label: "Sexta-feira", short: "Sex" },
  { key: "saturday", label: "Sábado", short: "Sáb" },
  { key: "sunday", label: "Domingo", short: "Dom" },
];

const timeOptions = Array.from({ length: 48 }).map((_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

export default function HorariosPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
    tuesday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
    wednesday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
    thursday: { isOpen: true, openTime: "08:00", closeTime: "22:00" },
    friday: { isOpen: true, openTime: "08:00", closeTime: "23:00" },
    saturday: { isOpen: true, openTime: "09:00", closeTime: "23:00" },
    sunday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch("/api/store/hours");
        if (data) {
          setIsStoreOpen(data.isOpen ?? true);
          if (data.schedule?.week) setSchedule(data.schedule.week);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updateDay(day: string, field: keyof DaySchedule, value: any) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  function copyToAllDays(day: string) {
    const base = schedule[day];
    const copy: WeekSchedule = {};
    daysOfWeek.forEach((d) => (copy[d.key] = { ...base }));
    setSchedule(copy);
  }

  async function handleSave() {
    if (saving) return;
    try {
      setSaving(true);
      await apiFetch("/api/store/hours", {
        method: "PUT",
        body: JSON.stringify({
          isOpen: isStoreOpen,
          schedule: { week: schedule },
        }),
      });
      alert("Horários salvos com sucesso ✅");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6">Carregando horários...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => history.back()}
              className="h-9 w-9 rounded-md flex items-center justify-center hover:bg-gray-100 transition"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Horários</h1>
              <p className="text-sm text-gray-500">
                Configure o funcionamento
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* STATUS */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between transition hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isStoreOpen ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Store
                className={isStoreOpen ? "text-green-600" : "text-red-600"}
              />
            </div>
            <div>
              <p className="font-semibold">Status da Loja</p>
              <p className="text-sm text-gray-500">
                {isStoreOpen ? "Aberta" : "Fechada manualmente"}
              </p>
            </div>
          </div>

          <input
            type="checkbox"
            checked={isStoreOpen}
            onChange={(e) => setIsStoreOpen(e.target.checked)}
            className="h-5 w-5 accent-green-600"
          />
        </div>

        {/* HORÁRIOS */}
        <div className="bg-white border border-gray-200 rounded-xl transition hover:shadow-sm">
          <div className="p-6 border-b flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Clock className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Horário de Funcionamento</p>
              <p className="text-sm text-gray-500">
                Configure os dias da semana
              </p>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {daysOfWeek.map((day) => {
              const d = schedule[day.key];
              return (
                <div
                  key={day.key}
                  className={`border rounded-xl p-4 transition ${
                    d.isOpen
                      ? "bg-white hover:shadow-sm"
                      : "bg-gray-50 opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-medium">
                        {day.short}
                      </div>
                      <div>
                        <p className="font-medium">{day.label}</p>
                        <p className="text-xs text-gray-500">
                          {d.isOpen ? "Aberto" : "Fechado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {d.isOpen && (
                        <>
                          <Sun size={14} />
                          <select
                            value={d.openTime}
                            onChange={(e) =>
                              updateDay(day.key, "openTime", e.target.value)
                            }
                            className="border rounded-md px-2 py-1 text-sm"
                          >
                            {timeOptions.map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>

                          <span className="text-gray-400">às</span>

                          <Moon size={14} />
                          <select
                            value={d.closeTime}
                            onChange={(e) =>
                              updateDay(day.key, "closeTime", e.target.value)
                            }
                            className="border rounded-md px-2 py-1 text-sm"
                          >
                            {timeOptions.map((t) => (
                              <option key={t}>{t}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => copyToAllDays(day.key)}
                            className="text-gray-400 hover:text-gray-900 transition"
                            title="Copiar para todos"
                          >
                            <Copy size={16} />
                          </button>
                        </>
                      )}

                      <input
                        type="checkbox"
                        checked={d.isOpen}
                        onChange={(e) =>
                          updateDay(day.key, "isOpen", e.target.checked)
                        }
                        className="h-5 w-5 accent-black"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
