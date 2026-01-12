"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  Save,
  Store,
  Sun,
  Moon,
  Copy,
  Check,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

/* ===============================
   TIPOS
=============================== */
interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface WeekSchedule {
  [key: string]: DaySchedule;
}

/* ===============================
   CONSTANTES
=============================== */
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

/* ===============================
   PAGE
=============================== */
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
        console.error(err);
        toast.error("Erro ao carregar horários");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ===============================
     HELPERS
  =============================== */
  function updateDay(
    day: string,
    field: keyof DaySchedule,
    value: boolean | string
  ) {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  }

  function copyToAllDays(sourceDay: string) {
    const source = schedule[sourceDay];
    const updated: WeekSchedule = {};

    daysOfWeek.forEach((d) => {
      updated[d.key] = { ...source };
    });

    setSchedule(updated);
    toast.success("Horário copiado para todos os dias");
  }

  function getTodayStatus() {
    const map = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = map[new Date().getDay()];
    const day = schedule[today];

    if (!isStoreOpen) return { open: false, label: "Loja fechada manualmente" };
    if (!day?.isOpen) return { open: false, label: "Fechado hoje" };

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    if (time >= day.openTime && time <= day.closeTime) {
      return { open: true, label: `Aberto até ${day.closeTime}` };
    }

    return { open: false, label: `Abre às ${day.openTime}` };
  }

  /* ===============================
     SAVE — /api/store/hours
  =============================== */
  async function handleSave() {
    if (saving) return;

    try {
      setSaving(true);

      await apiFetch("/api/store/hours", {
        method: "PUT",
        body: JSON.stringify({
          isOpen: isStoreOpen,
          schedule: {
            week: schedule,
          },
        }),
      });

      toast.success("Horários salvos com sucesso ✅");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar horários");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="p-6">Carregando horários...</p>;
  }

  const status = getTodayStatus();

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Horários</h1>
              <p className="text-sm text-muted-foreground">
                Configure o funcionamento
              </p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6 pb-10">
        {/* STATUS */}
        <Card className="overflow-hidden">
          <div
            className={`h-1.5 ${
              isStoreOpen ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isStoreOpen ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Store
                    className={`w-6 h-6 ${
                      isStoreOpen ? "text-green-600" : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <CardTitle>Status da Loja</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge
                      className={
                        status.open
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {status.open ? "Aberto" : "Fechado"}
                    </Badge>
                    <span className="text-xs">{status.label}</span>
                  </CardDescription>
                </div>
              </div>

              <Switch
                checked={isStoreOpen}
                onCheckedChange={setIsStoreOpen}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {isStoreOpen
                ? "A loja está aceitando pedidos conforme os horários abaixo."
                : "A loja está fechada e não aceita pedidos."}
            </p>
          </CardContent>
        </Card>

        {/* SEMANA */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Horário de Funcionamento</CardTitle>
                <CardDescription>
                  Configure os horários de cada dia da semana
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {daysOfWeek.map((day) => (
              <div
                key={day.key}
                className={`p-4 rounded-xl border ${
                  schedule[day.key].isOpen
                    ? "bg-background"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
                        schedule[day.key].isOpen
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {day.short}
                    </div>
                    <div>
                      <Label>{day.label}</Label>
                      <p className="text-xs text-muted-foreground">
                        {schedule[day.key].isOpen ? "Aberto" : "Fechado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {schedule[day.key].isOpen && (
                      <>
                        <Sun className="w-4 h-4 text-amber-500" />
                        <Select
                          value={schedule[day.key].openTime}
                          onValueChange={(v) =>
                            updateDay(day.key, "openTime", v)
                          }
                        >
                          <SelectTrigger className="w-24 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <span className="text-muted-foreground">às</span>

                        <Moon className="w-4 h-4 text-indigo-500" />
                        <Select
                          value={schedule[day.key].closeTime}
                          onValueChange={(v) =>
                            updateDay(day.key, "closeTime", v)
                          }
                        >
                          <SelectTrigger className="w-24 h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeOptions.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToAllDays(day.key)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    <Switch
                      checked={schedule[day.key].isOpen}
                      onCheckedChange={(v) =>
                        updateDay(day.key, "isOpen", v)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AÇÕES RÁPIDAS */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const all: WeekSchedule = {};
                daysOfWeek.forEach((d) => {
                  all[d.key] = {
                    isOpen: true,
                    openTime: "08:00",
                    closeTime: "22:00",
                  };
                });
                setSchedule(all);
                toast.success("Todos os dias abertos");
              }}
            >
              <Check className="w-4 h-4 mr-2" />
              Abrir todos
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSchedule((prev) => ({
                  ...prev,
                  saturday: { ...prev.saturday, isOpen: false },
                  sunday: { ...prev.sunday, isOpen: false },
                }));
                toast.success("Fins de semana fechados");
              }}
            >
              Fechar fins de semana
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
