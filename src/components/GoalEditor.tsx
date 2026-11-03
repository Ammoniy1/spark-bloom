import React from 'react';
import { Pressable, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { GOAL_MAX, GOAL_MIN, GOAL_STEP } from '@/lib/sparkLogic';
import { fmt } from '@/lib/format';
import { useTheme } from '@/theme/useTheme';
import Icon from './Icon';
import { T } from './ui';

const PRESETS = [5000, 8000, 12000];

/** Цель по шагам: большое число, слайдер 2000–20000 (шаг 500), −/+, пресеты. */
export default function GoalEditor({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const { t } = useTheme();
  const set = (v: number) => onChange(Math.min(Math.max(v, GOAL_MIN), GOAL_MAX));
  const round = (b: { onPress: () => void; icon: 'minus' | 'plus'; label: string }) => (
    <Pressable
      accessibilityLabel={b.label}
      onPress={b.onPress}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: t.card,
        borderWidth: 1,
        borderColor: t.cardBorder,
        opacity: pressed ? 0.7 : 1,
      })}>
      <Icon name={b.icon} color={t.text} />
    </Pressable>
  );
  return (
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {round({ icon: 'minus', label: 'Уменьшить', onPress: () => set(value - GOAL_STEP) })}
        <View style={{ alignItems: 'center' }}>
          <T v="big">{fmt(value)}</T>
          <T v="mono">шагов в день</T>
        </View>
        {round({ icon: 'plus', label: 'Увеличить', onPress: () => set(value + GOAL_STEP) })}
      </View>
      <Slider
        minimumValue={GOAL_MIN}
        maximumValue={GOAL_MAX}
        step={GOAL_STEP}
        value={value}
        onValueChange={set}
        minimumTrackTintColor={t.accent}
        maximumTrackTintColor={t.divider}
        thumbTintColor={t.accent}
      />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {PRESETS.map(p => {
          const on = p === value;
          return (
            <Pressable
              key={p}
              onPress={() => set(p)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: on ? t.accent : t.cardBorder,
                backgroundColor: on ? t.accent + '22' : t.card2,
              }}>
              <T style={{ fontWeight: '600' }} color={on ? t.accent : t.text}>
                {fmt(p)}
              </T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
