"use client";

export const dynamic = "force-dynamic";

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
import { toast } from "sonner";

/* =======================
   TYPES
======================= */
interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface WeekSchedule {
  [key: string]: DaySchedule;
}

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

const timeOptions = [
  "00:00","00:30","01:00","01:30","02:00","02:30","03:00","03:30",
  "04:00","04:30","05:00","05:30","06:00","06:30","07:00","07:30",
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30",
  "20:00","20:30","21:00","21:30","22:00","22:30","23:00","23:30",
];

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

  /* =======================
     LOAD
  ======================= */
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
      } catch {
        toast.error("Erro ao carregar horários");
      }
    }
    load();
  }, []);

  /* =======================
     HELPERS
  ======================= */
  const updateDaySchedule = (
    day: string,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const copyToAllDays = (sourceDay: string) => {
    const base = schedule[sourceDay];
    const copy: WeekSchedule = {};
    daysOfWeek.forEach((d) => (copy[d.key] = { ...base }));
    setSchedule(copy);
    toast.success("Horário copiado para todos os dias");
  };

  const handleSave = async () => {
    await apiFetch("/api/store/hours", {
      method: "PUT",
      body: JSON.stringify({
        isOpen: isStoreOpen,
        schedule: { week: schedule },
      }),
    });
    toast.success("Horários salvos com sucesso!");
  };

  const getCurrentDayStatus = () => {
    const map = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const today = map[new Date().getDay()];
    const todaySchedule = schedule[today];

    if (!isStoreOpen) return { status: "closed", message: "Loja fechada manualmente" };
    if (!todaySchedule?.isOpen) return { status: "closed", message: "Fechado hoje" };

    const now = new Date();
    const current = `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`;

    if (current >= todaySchedule.openTime && current <= todaySchedule.closeTime) {
      return { status: "open", message: `Aberto até ${todaySchedule.closeTime}` };
    }

    return { status: "closed", message: `Abre às ${todaySchedule.openTime}` };
  };

  const storeStatus = getCurrentDayStatus();

  /* =======================
     RENDER
  ======================= */
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
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-8">
        {/* STATUS */}
        <Card className="overflow-hidden">
          <div className={`h-1.5 ${isStoreOpen ? "bg-green-500" : "bg-red-500"}`} />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isStoreOpen ? "bg-green-100" : "bg-red-100"
                }`}>
                  <Store className={isStoreOpen ? "text-green-600" : "text-red-600"} />
                </div>
                <div>
                  <CardTitle>Status da Loja</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge className={
                      storeStatus.status === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }>
                      {storeStatus.status === "open" ? "Aberto" : "Fechado"}
                    </Badge>
                    <span className="text-xs">{storeStatus.message}</span>
                  </CardDescription>
                </div>
              </div>
              <Switch checked={isStoreOpen} onCheckedChange={setIsStoreOpen} />
            </div>
          </CardHeader>
        </Card>

        {/* HORÁRIOS */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="text-blue-600" />
              </div>
              <div>
                <CardTitle>Horário de Funcionamento</CardTitle>
                <CardDescription>Configure os horários da semana</CardDescription>
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
                    d.isOpen ? "hover:border-primary/30" : "bg-muted/30 border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-[140px]">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        d.isOpen ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        {day.short}
                      </div>
                      <div>
                        <Label>{day.label}</Label>
                        <p className="text-xs text-muted-foreground">
                          {d.isOpen ? "Aberto" : "Fechado"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {d.isOpen && (
                        <>
                          <Sun className="w-4 h-4 text-amber-500" />
                          <Select value={d.openTime} onValueChange={(v) => updateDaySchedule(day.key,"openTime",v)}>
                            <SelectTrigger className="w-24 h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>{timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>

                          <span className="text-muted-foreground">às</span>

                          <Moon className="w-4 h-4 text-indigo-500" />
                          <Select value={d.closeTime} onValueChange={(v) => updateDaySchedule(day.key,"closeTime",v)}>
                            <SelectTrigger className="w-24 h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>{timeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>

                          <Button variant="ghost" size="icon" onClick={() => copyToAllDays(day.key)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Switch checked={d.isOpen} onCheckedChange={(v) => updateDaySchedule(day.key,"isOpen",v)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* QUICK ACTIONS */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const all: WeekSchedule = {};
              daysOfWeek.forEach(d => all[d.key] = { isOpen: true, openTime: "08:00", closeTime: "22:00" });
              setSchedule(all);
              toast.success("Todos os dias abertos");
            }}>
              <Check className="w-4 h-4 mr-2" /> Abrir todos os dias
            </Button>

            <Button variant="outline" size="sm" onClick={() => {
              setSchedule(s => ({
                ...s,
                saturday: { ...s.saturday, isOpen: false },
                sunday: { ...s.sunday, isOpen: false },
              }));
              toast.success("Fins de semana fechados");
            }}>
              Fechar fins de semana
            </Button>

            <Button variant="outline" size="sm" onClick={() => {
              const commercial: WeekSchedule = {};
              daysOfWeek.forEach(d => {
                const weekend = d.key === "saturday" || d.key === "sunday";
                commercial[d.key] = { isOpen: !weekend, openTime: "09:00", closeTime: "18:00" };
              });
              setSchedule(commercial);
              toast.success("Horário comercial aplicado");
            }}>
              Horário comercial
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
