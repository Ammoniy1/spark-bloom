import { NativeModules, Platform } from 'react-native';
import type { ThemeName } from '../theme/tokens';

export interface WidgetState {
  steps: number;
  goalSteps: number;
  streakDays: number;
  theme: ThemeName;
}

type BridgeModule = {
  updateState(
    steps: number,
    goalSteps: number,
    streakDays: number,
    theme: string,
  ): void;
};

const Bridge: BridgeModule | undefined = NativeModules.SparkBloomWidgetBridge;

let last = '';

/**
 * Пишет состояние в общее хранилище (iOS App Group / Android DataStore)
 * и просит ОС перерисовать виджет. Без нативного модуля — тихо ничего не делает.
 */
export function syncWidgetState(s: WidgetState): void {
  const key = `${s.steps}|${s.goalSteps}|${s.streakDays}|${s.theme}`;
  if (key === last) return;
  last = key;
  if (!Bridge) {
    if (__DEV__) console.log(`[widget:${Platform.OS}] bridge not linked`, s);
    return;
  }
  try {
    Bridge.updateState(s.steps, s.goalSteps, s.streakDays, s.theme);
  } catch (e) {
    if (__DEV__) console.warn('[widget] updateState failed', e);
  }
}
