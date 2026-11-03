// Бизнес-логика Spark Bloom.
// ⚠ Пороги и формулы продублированы в Swift (native/ios-widget) и Kotlin (native/android-widget).
// При изменении — править во всех трёх местах.

export type Emotion = 'sad' | 'sleepy' | 'happy' | 'energetic';
export type Stage = 'ember' | 'spark' | 'glow' | 'blaze' | 'nova';

export const STAGES: Stage[] = ['ember', 'spark', 'glow', 'blaze', 'nova'];
/** Минимальная серия (дней) для входа в стадию. */
export const STAGE_THRESHOLDS: Record<Stage, number> = {
  ember: 0,
  spark: 3,
  glow: 7,
  blaze: 14,
  nova: 21,
};
export const STAGE_TITLE: Record<Stage, string> = {
  ember: 'Ember',
  spark: 'Spark',
  glow: 'Glow',
  blaze: 'Blaze',
  nova: 'Nova',
};

export const GOAL_MIN = 2000;
export const GOAL_MAX = 20000;
export const GOAL_STEP = 500;
export const STREAK_MAX = 999;

export const DEFAULTS = {
  steps: 6000,
  streak: 1,
  goal: 8000,
  theme: 'dark' as const,
};

export function getEmotion(steps: number): Emotion {
  if (steps < 3000) return 'sad';
  if (steps < 6500) return 'sleepy';
  if (steps < 10500) return 'happy';
  return 'energetic';
}

export function getStage(streak: number): Stage {
  if (streak >= 21) return 'nova';
  if (streak >= 14) return 'blaze';
  if (streak >= 7) return 'glow';
  if (streak >= 3) return 'spark';
  return 'ember';
}

/** Уровень = номер стадии, 1…5. */
export function getLevel(streak: number): number {
  return STAGES.indexOf(getStage(streak)) + 1;
}

export function getNextStage(streak: number): Stage | null {
  const i = STAGES.indexOf(getStage(streak));
  return i < STAGES.length - 1 ? STAGES[i + 1] : null;
}

/**
 * Прогресс внутри текущей стадии, 0…1.
 * (streak − порог текущей) / (порог следующей − порог текущей); на Nova = 1.
 */
export function getStageProgress(streak: number): number {
  const stage = getStage(streak);
  const next = getNextStage(streak);
  if (!next) return 1;
  const from = STAGE_THRESHOLDS[stage];
  const to = STAGE_THRESHOLDS[next];
  return Math.min(Math.max((streak - from) / (to - from), 0), 1);
}

export function progressPct(streak: number): number {
  return Math.round(getStageProgress(streak) * 100);
}

/** Локальная дата в ISO-формате YYYY-MM-DD (НЕ toISOString — тот в UTC). */
export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Разница в календарных днях между двумя локальными ISO-датами. */
export function daysBetween(fromISO: string, toISO: string): number {
  const [y1, m1, d1] = fromISO.split('-').map(Number);
  const [y2, m2, d2] = toISO.split('-').map(Number);
  // Date.UTC исключает влияние перехода на летнее время.
  return Math.round(
    (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000,
  );
}

export interface DayState {
  steps: number;
  goal: number;
  streak: number;
  lastActiveDateISO: string | null;
}

/**
 * Смена дня. Если сохранённая дата ≠ сегодня:
 * прошёл ровно 1 день и цель выполнена → streak+1, иначе streak = 0;
 * шаги обнуляются (кроме симуляции в debug: keepSteps = true).
 */
export function rolloverIfNewDay(
  s: DayState,
  today: string = todayISO(),
  opts: { keepSteps?: boolean } = {},
): DayState {
  if (!s.lastActiveDateISO || s.lastActiveDateISO === today) {
    return { ...s, lastActiveDateISO: s.lastActiveDateISO ?? today };
  }
  const gap = daysBetween(s.lastActiveDateISO, today);
  const streak =
    gap === 1 && s.steps >= s.goal ? Math.min(s.streak + 1, STREAK_MAX) : 0;
  return {
    ...s,
    streak,
    steps: opts.keepSteps ? s.steps : 0,
    lastActiveDateISO: today,
  };
}

// --- Activity ---
export const kmFromSteps = (steps: number) => steps * 0.00075;
export const kcalFromSteps = (steps: number) => steps * 0.045;
export const activeMinFromSteps = (steps: number) => steps / 135;

/** Детерминированный псевдорандом из прототипа. */
export function seededBars(
  seed: number,
  n: number,
  min: number,
  max: number,
): number[] {
  let x = seed;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    out.push(min + (x / 233280) * (max - min));
  }
  return out;
}

export const weekDays = (steps: number, goal: number) => [
  ...seededBars(steps * 3 + 11, 6, 0.35, 1.15).map(v => Math.round(v * goal)),
  steps,
];
export const monthDays = (steps: number, goal: number) => [
  ...seededBars(steps * 5 + 3, 29, 0.3, 1.2).map(v => Math.round(v * goal)),
  steps,
];
export const homeMiniBars = (steps: number) => seededBars(steps + 1, 12, 15, 100);
export const todayBars = (steps: number) => seededBars(steps + 7, 16, 6, 100);

/** Декоративный XP на экране Progress. */
export const xpFromProgress = (streak: number) =>
  Math.round(getStageProgress(streak) * 3000);
