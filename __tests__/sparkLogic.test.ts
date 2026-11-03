import {
  getEmotion,
  getStage,
  progressPct,
  rolloverIfNewDay,
  todayISO,
  daysBetween,
} from '../src/lib/sparkLogic';

test('настроение по шагам', () => {
  expect([2999, 3000, 6499, 6500, 10499, 10500].map(getEmotion)).toEqual([
    'sad', 'sleepy', 'sleepy', 'happy', 'happy', 'energetic',
  ]);
});

test('стадии и прогресс внутри стадии', () => {
  expect([0, 2, 3, 6, 7, 13, 14, 20, 21, 99].map(getStage)).toEqual([
    'ember', 'ember', 'spark', 'spark', 'glow', 'glow', 'blaze', 'blaze', 'nova', 'nova',
  ]);
  expect([0, 1, 3, 5, 7, 10, 14, 21].map(progressPct)).toEqual([0, 33, 0, 50, 0, 43, 0, 100]);
});

test('смена дня', () => {
  const base = { steps: 9000, goal: 8000, streak: 2, lastActiveDateISO: '2026-11-02' };
  expect(rolloverIfNewDay(base, '2026-11-03')).toMatchObject({ streak: 3, steps: 0 });
  expect(rolloverIfNewDay({ ...base, steps: 100 }, '2026-11-03')).toMatchObject({ streak: 0 });
  expect(rolloverIfNewDay(base, '2026-11-04')).toMatchObject({ streak: 0 });
  expect(rolloverIfNewDay(base, '2026-11-02')).toMatchObject({ streak: 2, steps: 9000 });
  expect(rolloverIfNewDay(base, '2026-11-03', { keepSteps: true }).steps).toBe(9000);
});

test('локальная дата и разница через переход на летнее время', () => {
  expect(todayISO(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  expect(daysBetween('2026-03-26', '2026-03-27')).toBe(1);
  expect(daysBetween('2026-10-24', '2026-10-25')).toBe(1);
});
