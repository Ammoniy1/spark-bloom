import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULTS,
  GOAL_MAX,
  GOAL_MIN,
  STREAK_MAX,
  rolloverIfNewDay,
  todayISO,
} from '../lib/sparkLogic';
import { syncWidgetState } from '../lib/widgetBridge';
import type { ThemeName } from '../theme/tokens';

export type DataSource = 'Apple Health' | 'Google Fit' | 'Вручную';

interface PersistedState {
  name: string;
  email: string;
  theme: ThemeName;
  goal: number;
  steps: number;
  streak: number;
  lastActiveDateISO: string | null;
  onboarded: boolean;
  // Settings
  activityGoalMin: number;
  notificationsOn: boolean;
  messageTime: string;
  dataSource: DataSource;
}

interface Actions {
  setName(name: string): void;
  setEmail(email: string): void;
  setTheme(theme: ThemeName): void;
  setGoal(goal: number): void;
  setSteps(steps: number): void;
  setStreak(streak: number): void;
  setSettings(p: Partial<Pick<PersistedState,
    'activityGoalMin' | 'notificationsOn' | 'messageTime' | 'dataSource'>>): void;
  finishOnboarding(): void;
  rollover(): void;
  /** Debug: симуляция нового дня, шаги не сбрасываются. */
  simulateNewDay(): void;
  resetAll(): void;
}

export type AppState = PersistedState & Actions & { hydrated: boolean };

const initial: PersistedState = {
  name: '',
  email: '',
  theme: DEFAULTS.theme,
  goal: DEFAULTS.goal,
  steps: DEFAULTS.steps,
  streak: DEFAULTS.streak,
  lastActiveDateISO: null,
  onboarded: false,
  activityGoalMin: 60,
  notificationsOn: true,
  messageTime: '9:00',
  dataSource: 'Вручную',
};

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

/** Вчерашняя локальная дата — для симуляции «нового дня». */
function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayISO(d);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,
      hydrated: false,
      setName: name => set({ name }),
      setEmail: email => set({ email }),
      setTheme: theme => set({ theme }),
      setGoal: goal => set({ goal: clamp(goal, GOAL_MIN, GOAL_MAX) }),
      setSteps: steps => set({ steps: Math.max(0, Math.round(steps)) }),
      setStreak: streak => set({ streak: clamp(streak, 0, STREAK_MAX) }),
      setSettings: p => set(p),
      finishOnboarding: () =>
        set({ onboarded: true, lastActiveDateISO: todayISO() }),
      rollover: () => {
        const s = get();
        set(rolloverIfNewDay(s));
      },
      simulateNewDay: () => {
        const s = get();
        set(
          rolloverIfNewDay(
            { ...s, lastActiveDateISO: yesterdayISO() },
            todayISO(),
            { keepSteps: true },
          ),
        );
      },
      resetAll: () => set({ ...initial }),
    }),
    {
      name: 'spark-bloom-state',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ hydrated, ...rest }) => {
        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(rest)) {
          if (typeof v !== 'function') out[k] = v;
        }
        return out as unknown as PersistedState;
      },
      onRehydrateStorage: () => state => {
        if (state?.onboarded) state.rollover();
        useAppStore.setState({ hydrated: true });
      },
    },
  ),
);

// Любая запись, затрагивающая виджет, → синхронизация с общим хранилищем.
useAppStore.subscribe(s =>
  syncWidgetState({
    steps: s.steps,
    goalSteps: s.goal,
    streakDays: s.streak,
    theme: s.theme,
  }),
);
