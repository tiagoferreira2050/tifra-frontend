"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import {
  ArrowLeft,
  Clock,
  Save,
  Store,
  Sun,
  Moon,
  Copy,
  CalendarOff,
  Plus,
  Trash2,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
import { Input } from "@/components/ui/input";

import { getStoreStatus } from "@/lib/store-status";

/* ================= TYPES ================= */
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

/* ================= CONSTANTS ================= */
const daysOfWeek = [
  { key: "monday", label: "Segunda-feira", short: "Seg" },
  { key: "tuesday", label: "Terça-feira", short: "Ter" },
  { key: "wednesday", label: "Quarta-feira", short: "Qua" },
  { key: "thursday", label: "Quinta-feira", short: "Qui" },
  { key: "friday", label: "Sexta-feira", short: "Sex" },
  { key: "saturday", label: "Sábado", short: "Sáb" },
  { key: "sunday", label: "Domingo", short: "Dom" },
] as const;

const timeOptions = [
  "00:00","00:30","01:00","01:30","02:00","02:30","03:00","03:30",
  "04:00","04:30","05:00","05:30","06:00","06:30","07:00","07:30",
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  "20:00","20:30","21:00","21:30","22:00","22:30","23:00","23:30",
];

/* ================= PAGE ================= */
export default function HorariosPage() {
  const router = useRouter();

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

  const storeStatus = getStoreStatus({
    isStoreOpen,
    schedule,
    pauses: scheduledPauses,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Horários</h1>
              <p className="text-sm text-muted-foreground">
                Configure o funcionamento
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-8">
        {/* STATUS */}
        <Card className="overflow-hidden">
          <div
            className={`h-1.5 ${
              storeStatus.status === "open"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    storeStatus.status === "open"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle>Status da Loja</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge
                      className={
                        storeStatus.status === "open"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }
                    >
                      {storeStatus.status === "open" ? "Aberto" : "Fechado"}
                    </Badge>
                    <span>{storeStatus.message}</span>
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
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {storeStatus.status === "open"
                ? "A loja está aceitando pedidos conforme os horários configurados abaixo."
                : "A loja está fechada e não aceita pedidos no momento."}
            </p>
          </CardContent>
        </Card>

        {/* HORÁRIOS */}
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
                        <Label className="font-medium">{day.label}</Label>
                        <p className="text-xs text-muted-foreground">
                          {d.isOpen ? "Aberto" : "Fechado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {d.isOpen && (
                        <>
                          <Sun className="w-4 h-4 text-amber-500" />
                          <Select
                            value={d.openTime}
                            onValueChange={(v) =>
                              setSchedule((prev) => ({
                                ...prev,
                                [day.key]: { ...prev[day.key], openTime: v },
                              }))
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
                            value={d.closeTime}
                            onValueChange={(v) =>
                              setSchedule((prev) => ({
                                ...prev,
                                [day.key]: { ...prev[day.key], closeTime: v },
                              }))
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
                        </>
                      )}
                      <Switch
                        checked={d.isOpen}
                        onCheckedChange={(checked) =>
                          setSchedule((prev) => ({
                            ...prev,
                            [day.key]: { ...prev[day.key], isOpen: checked },
                          }))
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
