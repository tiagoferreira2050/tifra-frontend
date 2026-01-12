/* =========================================================
   🧠 STORE STATUS ENGINE
   Regra única para decidir se a loja está aberta ou fechada
========================================================= */

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;  // "08:00"
  closeTime: string; // "22:00"
}

export interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface ScheduledPause {
  id?: string;
  name: string;
  startDate: string; // "2025-12-24"
  endDate: string;   // "2025-12-26"
}

export type StoreStatus =
  | {
      status: "open";
      message: string;
      closesAt: string;
    }
  | {
      status: "closed";
      message: string;
      opensAt?: string;
      reason:
        | "manual"
        | "pause"
        | "day_closed"
        | "out_of_hours";
    };

interface GetStoreStatusParams {
  isStoreOpen: boolean;
  schedule: WeekSchedule;
  pauses: ScheduledPause[];
  now?: Date; // útil pra teste
}

/* =========================================================
   🕒 Helpers
========================================================= */

function getTodayKey(date: Date): keyof WeekSchedule {
  const map: (keyof WeekSchedule)[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return map[date.getDay()];
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function isDateWithinPause(date: Date, pause: ScheduledPause): boolean {
  try {
    const start = new Date(`${pause.startDate}T00:00:00`);
    const end = new Date(`${pause.endDate}T23:59:59`);
    return date >= start && date <= end;
  } catch {
    return false;
  }
}

/* =========================================================
   🔥 CORE FUNCTION
========================================================= */

export function getStoreStatus({
  isStoreOpen,
  schedule,
  pauses,
  now = new Date(),
}: GetStoreStatusParams): StoreStatus {
  /* 1️⃣ FECHAMENTO MANUAL */
  if (!isStoreOpen) {
    return {
      status: "closed",
      reason: "manual",
      message: "Loja fechada manualmente",
    };
  }

  /* 2️⃣ PAUSA PROGRAMADA */
  const activePause = pauses.find((pause) =>
    isDateWithinPause(now, pause)
  );

  if (activePause) {
    return {
      status: "closed",
      reason: "pause",
      message: `Pausa: ${activePause.name}`,
    };
  }

  /* 3️⃣ DIA DA SEMANA */
  const todayKey = getTodayKey(now);
  const todaySchedule = schedule[todayKey];

  if (!todaySchedule || !todaySchedule.isOpen) {
    return {
      status: "closed",
      reason: "day_closed",
      message: "Fechado hoje",
    };
  }

  /* 4️⃣ HORÁRIO */
  const currentMinutes =
    now.getHours() * 60 + now.getMinutes();

  const openMinutes = timeToMinutes(todaySchedule.openTime);
  const closeMinutes = timeToMinutes(todaySchedule.closeTime);

  if (
    currentMinutes >= openMinutes &&
    currentMinutes <= closeMinutes
  ) {
    return {
      status: "open",
      closesAt: todaySchedule.closeTime,
      message: `Aberto até ${todaySchedule.closeTime}`,
    };
  }

  /* 5️⃣ FORA DO HORÁRIO */
  return {
    status: "closed",
    reason: "out_of_hours",
    opensAt: todaySchedule.openTime,
    message: `Abre às ${todaySchedule.openTime}`,
  };
}
