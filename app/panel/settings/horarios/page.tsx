"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Sun,
  Moon,
  Copy,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type DaySchedule = {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type WeekSchedule = Record<string, DaySchedule>;

const daysOfWeek = [
  { key: "monday", label: "Segunda", short: "Seg" },
  { key: "tuesday", label: "Terça", short: "Ter" },
  { key: "wednesday", label: "Quarta", short: "Qua" },
  { key: "thursday", label: "Quinta", short: "Qui" },
  { key: "friday", label: "Sexta", short: "Sex" },
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
    saturday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
    sunday: { isOpen: false, openTime: "09:00", closeTime: "18:00" },
  });

  /* ===============================
     LOAD — /api/store/hours
  =============================== */
  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch("/api/store/hours");

        if (data) {
          setIsStoreOpen(data.isOpen ?? true);
          if (data.schedule?.week) {
            setSchedule(data.schedule.week);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar horários", err);
        alert("Erro ao carregar horários");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function updateDay(
    day: string,
    field: keyof DaySchedule,
    value: string | boolean
  ) {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  }

  function copyToAllDays(day: string) {
    const base = schedule[day];
    const copy: WeekSchedule = {};

    daysOfWeek.forEach((d) => {
      copy[d.key] = { ...base };
    });

    setSchedule(copy);
    alert("Horário copiado para todos os dias");
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
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar horários");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6">Carregando horários...</p>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <div className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-6 py-5 grid grid-cols-3 items-center">
          <button
            onClick={() => window.history.back()}
            className="text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft />
          </button>

          <h1 className="text-center text-xl font-bold">
            Horários
          </h1>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* STATUS */}
        <div className="border rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold">Status da loja</p>
            <p className="text-sm text-gray-500">
              {isStoreOpen
                ? "Aceitando pedidos"
                : "Loja fechada"}
            </p>
          </div>

          <input
            type="checkbox"
            checked={isStoreOpen}
            onChange={(e) => setIsStoreOpen(e.target.checked)}
            className="h-5 w-5"
          />
        </div>

        {/* DIAS */}
        {daysOfWeek.map((day) => (
          <div
            key={day.key}
            className="border rounded-xl p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-medium">
                  {day.short}
                </div>
                <div>
                  <p className="font-medium">{day.label}</p>
                  <p className="text-xs text-gray-500">
                    {schedule[day.key].isOpen ? "Aberto" : "Fechado"}
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={schedule[day.key].isOpen}
                onChange={(e) =>
                  updateDay(day.key, "isOpen", e.target.checked)
                }
              />
            </div>

            {schedule[day.key].isOpen && (
              <div className="flex items-center gap-3">
                <Sun size={16} />
                <select
                  value={schedule[day.key].openTime}
                  onChange={(e) =>
                    updateDay(day.key, "openTime", e.target.value)
                  }
                  className="border rounded px-2 py-1"
                >
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <span>às</span>

                <Moon size={16} />
                <select
                  value={schedule[day.key].closeTime}
                  onChange={(e) =>
                    updateDay(day.key, "closeTime", e.target.value)
                  }
                  className="border rounded px-2 py-1"
                >
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => copyToAllDays(day.key)}
                  className="ml-auto text-gray-500 hover:text-black"
                  title="Copiar para todos"
                >
                  <Copy size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
