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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/configuracoes')}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Horários</h1>
              <p className="text-sm text-muted-foreground">Configure o funcionamento</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-6 pb-8">
        {/* Store Status Card */}
        <Card className="overflow-hidden">
          <div className={`h-1.5 ${isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`} />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isStoreOpen ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Store className={`w-6 h-6 ${isStoreOpen ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">Status da Loja</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={storeStatus.status === 'open' ? 'default' : 'secondary'}
                      className={storeStatus.status === 'open' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                        : 'bg-red-100 text-red-700 hover:bg-red-100'
                      }
                    >
                      {storeStatus.status === 'open' ? 'Aberto' : 'Fechado'}
                    </Badge>
                    <span className="text-xs">{storeStatus.message}</span>
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
              {isStoreOpen 
                ? 'A loja está aceitando pedidos conforme os horários configurados abaixo.'
                : 'A loja está fechada e não aceita pedidos no momento.'}
            </p>
          </CardContent>
        </Card>

        {/* Weekly Schedule */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Horário de Funcionamento</CardTitle>
                <CardDescription>Configure os horários de cada dia da semana</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {daysOfWeek.map((day, index) => (
              <div 
                key={day.key}
                className={`p-4 rounded-xl border transition-all ${
                  schedule[day.key].isOpen 
                    ? 'bg-background border-border hover:border-primary/30' 
                    : 'bg-muted/30 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Day name and toggle */}
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
                      schedule[day.key].isOpen 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {day.short}
                    </div>
                    <div>
                      <Label className={`font-medium ${!schedule[day.key].isOpen && 'text-muted-foreground'}`}>
                        {day.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {schedule[day.key].isOpen ? 'Aberto' : 'Fechado'}
                      </p>
                    </div>
                  </div>

                  {/* Time selectors */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    {schedule[day.key].isOpen && (
                      <>
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <Select
                            value={schedule[day.key].openTime}
                            onValueChange={(value) => updateDaySchedule(day.key, 'openTime', value)}
                          >
                            <SelectTrigger className="w-24 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <span className="text-muted-foreground">às</span>
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-indigo-500" />
                          <Select
                            value={schedule[day.key].closeTime}
                            onValueChange={(value) => updateDaySchedule(day.key, 'closeTime', value)}
                          >
                            <SelectTrigger className="w-24 h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map(time => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => copyToAllDays(day.key)}
                          title="Copiar para todos os dias"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    <Switch
                      checked={schedule[day.key].isOpen}
                      onCheckedChange={(checked) => updateDaySchedule(day.key, 'isOpen', checked)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const allOpen: WeekSchedule = {};
                  daysOfWeek.forEach(day => {
                    allOpen[day.key] = { isOpen: true, openTime: '08:00', closeTime: '22:00' };
                  });
                  setSchedule(allOpen);
                  toast.success('Todos os dias abertos');
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                Abrir todos os dias
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const weekends: WeekSchedule = { ...schedule };
                  weekends.saturday = { ...weekends.saturday, isOpen: false };
                  weekends.sunday = { ...weekends.sunday, isOpen: false };
                  setSchedule(weekends);
                  toast.success('Fins de semana fechados');
                }}
              >
                Fechar fins de semana
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const commercial: WeekSchedule = {};
                  daysOfWeek.forEach(day => {
                    const isWeekend = day.key === 'saturday' || day.key === 'sunday';
                    commercial[day.key] = { 
                      isOpen: !isWeekend, 
                      openTime: '09:00', 
                      closeTime: '18:00' 
                    };
                  });
                  setSchedule(commercial);
                  toast.success('Horário comercial aplicado');
                }}
              >
                Horário comercial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
