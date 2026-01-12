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

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

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

  /* ===============================
     LOAD
  =============================== */
  useEffect(() => {
    async function load() {
      const data = await apiFetch("/api/store/hours");
      if (data) {
        setIsStoreOpen(data.isOpen ?? true);
        if (data.schedule?.week) {
          setSchedule(data.schedule.week);
        }
      }
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
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  }

  function copyToAllDays(sourceDay: string) {
    const base = schedule[sourceDay];
    const copy: WeekSchedule = {};
    daysOfWeek.forEach((d) => (copy[d.key] = { ...base }));
    setSchedule(copy);
  }

  async function handleSave() {
    await apiFetch("/api/store/hours", {
      method: "PUT",
      body: JSON.stringify({
        isOpen: isStoreOpen,
        schedule: { week: schedule },
      }),
    });

    alert("Horários salvos com sucesso!");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
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

      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-8">
        {/* STATUS DA LOJA */}
        <Card className="overflow-hidden">
          <div
            className={`h-1.5 ${
              isStoreOpen ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isStoreOpen ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Store
                    className={`w-6 h-6 ${
                      isStoreOpen
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    Status da Loja
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge
                      className={
                        isStoreOpen
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {isStoreOpen ? "Aberto" : "Fechado"}
                    </Badge>
                  </CardDescription>
                </div>
              </div>

              <Switch
                checked={isStoreOpen}
                onCheckedChange={setIsStoreOpen}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </CardHeader>
        </Card>

        {/* HORÁRIOS */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  Horário de Funcionamento
                </CardTitle>
                <CardDescription>
                  Configure os horários da semana
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {daysOfWeek.map((day) => {
              const d = schedule[day.key];
              return (
                <div
                  key={day.key}
                  className={`p-4 rounded-xl border transition-all ${
                    d.isOpen
                      ? "bg-background hover:border-primary/30"
                      : "bg-muted/30 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
                          d.isOpen
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {day.short}
                      </div>
                      <div>
                        <Label
                          className={`font-medium ${
                            !d.isOpen && "text-muted-foreground"
                          }`}
                        >
                          {day.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {d.isOpen ? "Aberto" : "Fechado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-1 justify-end">
                      {d.isOpen && (
                        <>
                          <Sun className="w-4 h-4 text-amber-500" />
                          <Select
                            value={d.openTime}
                            onValueChange={(v) =>
                              updateDaySchedule(
                                day.key,
                                "openTime",
                                v
                              )
                            }
                          >
                            <SelectTrigger className="w-24 h-9">
<SelectValue>{d.openTime}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <span className="text-muted-foreground">
                            às
                          </span>

                          <Moon className="w-4 h-4 text-indigo-500" />
                          <Select
                            value={d.closeTime}
                            onValueChange={(v) =>
                              updateDaySchedule(
                                day.key,
                                "closeTime",
                                v
                              )
                            }
                          >
                            <SelectTrigger className="w-24 h-9">
                              <SelectValue>{d.closeTime}</SelectValue>
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
                            onClick={() =>
                              copyToAllDays(day.key)
                            }
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      <Switch
                        checked={d.isOpen}
                        onCheckedChange={(v) =>
                          updateDaySchedule(
                            day.key,
                            "isOpen",
                            v
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
