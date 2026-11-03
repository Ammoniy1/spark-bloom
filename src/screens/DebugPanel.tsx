import React from 'react';
import { Alert, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Button, Card, Segmented, T } from '@/components/ui';
import { fmt } from '@/lib/format';
import { STAGE_TITLE, getEmotion, getStage, progressPct } from '@/lib/sparkLogic';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import type { ThemeName } from '@/theme/tokens';

/** Скрытый экран разработки: 5 тапов по «Spark Bloom 1.0.0» в More. */
export default function DebugPanel() {
  const { t } = useTheme();
  const s = useAppStore();
  return (
    <>
      <Card style={{ gap: 10 }}>
        <T v="mono">Шаги сегодня</T>
        <T v="display">{fmt(s.steps)}</T>
        <Slider
          minimumValue={0}
          maximumValue={14000}
          step={200}
          value={s.steps}
          onValueChange={s.setSteps}
          minimumTrackTintColor={t.accent}
          maximumTrackTintColor={t.divider}
          thumbTintColor={t.accent}
        />
      </Card>
      <Card style={{ gap: 10 }}>
        <T v="mono">Серия, дней</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Button kind="ghost" label="−" style={{ flex: 1 }} onPress={() => s.setStreak(s.streak - 1)} />
          <T v="display" style={{ minWidth: 60, textAlign: 'center' }}>{s.streak}</T>
          <Button kind="ghost" label="+" style={{ flex: 1 }} onPress={() => s.setStreak(s.streak + 1)} />
        </View>
      </Card>
      <Segmented<ThemeName>
        value={s.theme}
        onChange={s.setTheme}
        options={[
          { key: 'dark', label: 'Тёмная' },
          { key: 'light', label: 'Светлая' },
        ]}
      />
      <Card soft style={{ gap: 4 }}>
        <T v="mono">Состояние</T>
        <T>{`Стадия: ${STAGE_TITLE[getStage(s.streak)]} · ${progressPct(s.streak)}%`}</T>
        <T>{`Настроение: ${getEmotion(s.steps)}`}</T>
        <T>{`Цель: ${fmt(s.goal)} · дата: ${s.lastActiveDateISO ?? '—'}`}</T>
      </Card>
      <Button
        label="Симулировать новый день"
        onPress={() => {
          const before = s.streak;
          s.simulateNewDay();
          const after = useAppStore.getState().streak;
          Alert.alert('Новый день', after > before ? `Цель выполнена — серия ${after}` : 'Цель не выполнена — серия сброшена');
        }}
      />
      <Button kind="danger" label="Сбросить всё" onPress={s.resetAll} />
    </>
  );
}
