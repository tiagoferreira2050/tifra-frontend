"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Store,
  Sun,
  Moon,
  Copy,
  Plus,
  Trash2,
} from "lucide-react";

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
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { format, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/* =======================
   TYPES
======================= */
type DaySchedule = {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
};

type WeekSchedule = Record<string, DaySchedule>;

type ScheduledPause = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

/* =======================
   CONSTANTS
======================= */
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

/* =======================
   PAGE
======================= */
export default function HorariosPage() {
  const router = useRouter();

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

  const [scheduledPauses, setScheduledPauses] = useState<ScheduledPause[]>([]);
  const [newPause, setNewPause] = useState<Omit<ScheduledPause, "id">>({
    name: "",
    startDate: "",
    endDate: "",
  });

  /* LOAD */
  useEffect(() => {
    async function load() {
      const data = await apiFetch("/api/store/hours");
      if (!data) return;

      setIsStoreOpen(data.isOpen ?? true);
      if (data.schedule?.week) setSchedule(data.schedule.week);
      if (data.schedule?.pauses) setScheduledPauses(data.schedule.pauses);
    }
    load();
  }, []);

  function updateDaySchedule(
    day: string,
    field: keyof DaySchedule,
    value: string | boolean
  ) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  function copyToAllDays(sourceDay: string) {
    const base = schedule[sourceDay];
    const copy: WeekSchedule = {};
    daysOfWeek.forEach((d) => (copy[d.key] = { ...base }));
    setSchedule(copy);
  }

  function getActivePause() {
    const now = new Date();
    return scheduledPauses.find((p) =>
      isWithinInterval(now, {
        start: parseISO(p.startDate),
        end: parseISO(p.endDate),
      })
    );
  }

  function formatDate(date: string) {
    return format(parseISO(date), "dd 'de' MMM", { locale: ptBR });
  }

  function addPause() {
    if (!newPause.name || !newPause.startDate || !newPause.endDate) return;

    setScheduledPauses((prev) => [
      ...prev,
      { ...newPause, id: Date.now().toString() },
    ]);

    setNewPause({ name: "", startDate: "", endDate: "" });
  }

  function removePause(id: string) {
    setScheduledPauses((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleSave() {
    await apiFetch("/api/store/hours", {
      method: "PUT",
      body: JSON.stringify({
        isOpen: isStoreOpen,
        schedule: {
          week: schedule,
          pauses: scheduledPauses,
        },
      }),
    });

    alert("Horários salvos com sucesso!");
  }

  const activePause = getActivePause();

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.back()}
              className="h-9 w-9 p-0 hover:bg-muted"
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

          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6">
        {/* STATUS */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isStoreOpen ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Store
                    className={
                      isStoreOpen ? "text-green-600" : "text-red-600"
                    }
                  />
                </div>
                <div>
                  <CardTitle>Status da Loja</CardTitle>
                  <CardDescription className="flex gap-2 items-center">
                    <Badge>
                      {isStoreOpen ? "Aberto" : "Fechado"}
                    </Badge>
                    {activePause && (
                      <span className="text-xs text-muted-foreground">
                        Pausa: {activePause.name}
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              <Switch checked={isStoreOpen} onCheckedChange={setIsStoreOpen} />
            </div>
          </CardHeader>
        </Card>

        {/* SEMANA */}
        <Card>
          <CardHeader>
            <CardTitle>Horário de Funcionamento</CardTitle>
            <CardDescription>Configure os horários da semana</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {daysOfWeek.map((day) => {
              const d = schedule[day.key];
              return (
                <div key={day.key} className="p-4 rounded-xl border">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center font-medium">
                        {day.short}
                      </div>
                      <div>
                        <Label>{day.label}</Label>
                        <p className="text-xs text-muted-foreground">
                          {d.isOpen ? "Aberto" : "Fechado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      {d.isOpen && (
                        <>
                          <Sun className="w-4 h-4" />
                          <Select
                            value={d.openTime}
                            onValueChange={(v) =>
                              updateDaySchedule(day.key, "openTime", v)
                            }
                          >
                            <SelectTrigger className="w-24 h-9">
                              <span>{d.openTime}</span>
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Moon className="w-4 h-4" />
                          <Select
                            value={d.closeTime}
                            onValueChange={(v) =>
                              updateDaySchedule(day.key, "closeTime", v)
                            }
                          >
                            <SelectTrigger className="w-24 h-9">
                              <span>{d.closeTime}</span>
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
                            onClick={() => copyToAllDays(day.key)}
                            className="h-9 w-9 p-0 hover:bg-muted"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      <Switch
                        checked={d.isOpen}
                        onCheckedChange={(v) =>
                          updateDaySchedule(day.key, "isOpen", v)
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* PAUSAS */}
        <Card>
          <CardHeader>
            <CardTitle>Pausas Programadas</CardTitle>
            <CardDescription>Feriados ou fechamentos</CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {scheduledPauses.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center p-3 border rounded-xl"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(p.startDate)} até {formatDate(p.endDate)}
                  </p>
                </div>
                <Button
                  onClick={() => removePause(p.id)}
                  className="h-9 w-9 p-0 hover:bg-muted"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <div className="p-4 border rounded-xl space-y-3">
              <Input
                placeholder="Nome da pausa"
                value={newPause.name}
                onChange={(e) =>
                  setNewPause({ ...newPause, name: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={newPause.startDate}
                  onChange={(e) =>
                    setNewPause({ ...newPause, startDate: e.target.value })
                  }
                />
                <Input
                  type="date"
                  value={newPause.endDate}
                  onChange={(e) =>
                    setNewPause({ ...newPause, endDate: e.target.value })
                  }
                />
              </div>
              <Button onClick={addPause} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Adicionar pausa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
