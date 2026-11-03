import React, { useState } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Screen, Segmented, T, TopBar } from '@/components/ui';
import { Bars, Ring } from '@/components/charts';
import Icon, { type IconName } from '@/components/Icon';
import { fmt } from '@/lib/format';
import {
  activeMinFromSteps,
  kcalFromSteps,
  kmFromSteps,
  monthDays,
  todayBars,
  weekDays,
} from '@/lib/sparkLogic';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';

type Period = 'day' | 'week' | 'month';
const ORDER: Period[] = ['day', 'week', 'month'];

export default function ActivityScreen() {
  const nav = useNavigation();
  const { t } = useTheme();
  const steps = useAppStore(s => s.steps);
  const goal = useAppStore(s => s.goal);
  const [period, setPeriod] = useState<Period>('day');

  const days = period === 'week' ? weekDays(steps, goal) : period === 'month' ? monthDays(steps, goal) : [steps];
  const total = days.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / days.length);
  const center = period === 'day' ? steps : avg;

  const km = kmFromSteps(total);
  const kcal = kcalFromSteps(total);
  const min = activeMinFromSteps(total);

  const chart =
    period === 'day'
      ? { title: 'Шаги в течение дня', values: todayBars(steps), axis: ['0', '6', '12', '18', '24'], goal: undefined, last: false }
      : period === 'week'
        ? { title: 'Шаги по дням недели', values: days, axis: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], goal, last: true }
        : { title: 'Шаги по дням месяца', values: days, axis: ['1', '10', '20', '30'], goal, last: true };

  return (
    <Screen
      top={
        <TopBar
          title="Activity"
          left={{ icon: 'back', label: 'Назад', onPress: () => nav.navigate('Home' as never) }}
          right={{
            icon: 'calendar',
            label: 'Сменить период',
            onPress: () => setPeriod(p => ORDER[(ORDER.indexOf(p) + 1) % ORDER.length]),
          }}
        />
      }>
      <Segmented
        value={period}
        onChange={setPeriod}
        options={[
          { key: 'day', label: 'Сегодня' },
          { key: 'week', label: 'Неделя' },
          { key: 'month', label: 'Месяц' },
        ]}
      />
      <View style={{ alignItems: 'center', paddingVertical: 8 }}>
        <Ring value={center / goal}>
          <T v="display">{fmt(center)}</T>
          <T v="mono">{period === 'day' ? 'Шагов' : 'Средн. в день'}</T>
          <T v="dim" style={{ marginTop: 2 }}>Цель {fmt(goal)}</T>
        </Ring>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Stat icon="pin" value={fmt(km, 1)} unit="км" />
        <Stat icon="flame" value={fmt(kcal)} unit="ккал" />
        <Stat
          icon="clock"
          value={period === 'month' ? fmt(min / 60, 1) : fmt(min)}
          unit={period === 'month' ? 'ч' : 'мин'}
        />
      </View>
      <Card style={{ gap: 14 }}>
        <T v="h2">{chart.title}</T>
        <Bars values={chart.values} height={130} axis={chart.axis} goal={chart.goal} highlightLast={chart.last} />
      </Card>
    </Screen>
  );

  function Stat({ icon, value, unit }: { icon: IconName; value: string; unit: string }) {
    return (
      <Card style={{ flex: 1, gap: 6, padding: 14 }}>
        <Icon name={icon} color={t.accent} size={18} />
        <T v="title">{value}</T>
        <T v="mono">{unit}</T>
      </Card>
    );
  }
}
