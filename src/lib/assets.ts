import type { ImageSourcePropType } from 'react-native';
import { STAGES, type Emotion, type Stage } from './sparkLogic';
import { CHARACTER_IMAGES, DUCK_IMAGES } from './assets.generated';

const EMOTIONS: Emotion[] = ['happy', 'sleepy', 'sad', 'energetic'];

/** Стадии в порядке близости к заданной: сначала сама, потом младшие, потом старшие. */
function stagesByCloseness(stage: Stage): Stage[] {
  const i = STAGES.indexOf(stage);
  const lower = STAGES.slice(0, i).reverse();
  const higher = STAGES.slice(i + 1);
  return [stage, ...lower, ...higher];
}

/**
 * Картинка персонажа `{stage}_{emotion}`. Пока не все картинки готовы:
 * та же эмоция на ближайшей стадии → happy на ближайшей стадии → любая.
 */
export function characterImage(stage: Stage, emotion: Emotion): ImageSourcePropType {
  const order = stagesByCloseness(stage);
  for (const e of [emotion, 'happy' as Emotion]) {
    for (const s of order) {
      const src = CHARACTER_IMAGES[`${s}_${e}`];
      if (src) return src;
    }
  }
  for (const s of order) {
    for (const e of EMOTIONS) {
      const src = CHARACTER_IMAGES[`${s}_${e}`];
      if (src) return src;
    }
  }
  // Сюда не попадаем: в сборке всегда есть хотя бы эталон spark_happy.
  return Object.values(CHARACTER_IMAGES)[0] as ImageSourcePropType;
}

/** Картинка утки-компаньона или null, пока её нет. */
export function duckImage(stage: Stage, emotion: Emotion): ImageSourcePropType | null {
  if (stage === 'ember') return DUCK_IMAGES.duck_ember ?? null;
  return (
    DUCK_IMAGES[`duck_${stage}_${emotion}`] ??
    DUCK_IMAGES[`duck_${stage}_happy`] ??
    null
  );
}

/** Где приложение рисует утку относительно персонажа (доли от размера картинки 2:3). */
export const DUCK_PLACEMENT: Record<Stage, { x: number; y: number; size: number }> = {
  ember: { x: 0.3, y: 0.21, size: 0.13 }, // яйцо на шапке, слева
  spark: { x: 0.3, y: 0.2, size: 0.15 },
  glow: { x: 0.5, y: 0.13, size: 0.2 }, // на макушке
  blaze: { x: 0.78, y: 0.55, size: 0.24 }, // на плече
  nova: { x: 0.86, y: 0.38, size: 0.26 }, // парит рядом
};
