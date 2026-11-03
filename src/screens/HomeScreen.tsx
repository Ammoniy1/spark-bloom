import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Card, ProgressBar, Screen, T, TopBar } from '@/components/ui';
import { Companion, useCompanion } from '@/components/Character';
import { Bars } from '@/components/charts';
import Icon from '@/components/Icon';
import { daysShort, fmt } from '@/lib/format';
import { STAGE_TITLE, getLevel, homeMiniBars, progressPct } from '@/lib/sparkLogic';
import { PHRASES } from '@/lib/texts';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import type { TabParamList } from '@/navigation/RootTabs';

export default function HomeScreen() {
  const nav = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const { t } = useTheme();
  const { stage, emotion, steps, streak } = useCompanion();
  const goal = useAppStore(s => s.goal);
  const name = useAppStore(s => s.name);
  const pct = progressPct(streak);

  return (
    <Screen
      top={
        <TopBar
          title="Home"
          left={{ icon: 'menu', label: 'Меню', onPress: () => nav.navigate('More', { section: undefined }) }}
          right={{ icon: 'bell', label: 'Уведомления', onPress: () => nav.navigate('More', { section: 'settings' }) }}
        />
      }>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: t.accent + '1f',
            borderWidth: 1,
            borderColor: t.accent + '55',
          }}>
          <Icon name="spark" color={t.accent} size={14} fill={t.accent} />
          <T v="mono" color={t.accent}>{`${STAGE_TITLE[stage]} · Level ${getLevel(streak)}`}</T>
        </View>
        <Companion height={270} />
      </View>

      <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Icon name="chat" color={t.accent} />
        <T style={{ flex: 1 }}>
          {name ? `${name}, ` : ''}
          {lowerFirst(PHRASES[emotion][0], !!name)}
        </T>
      </Card>

      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <T v="big">{fmt(steps)}</T>
            <T v="dim">Шагов сегодня · цель {fmt(goal)}</T>
          </View>
          <T v="title" color={t.accent}>{Math.min(100, Math.round((steps / goal) * 100))}%</T>
        </View>
        <Bars values={homeMiniBars(steps)} height={46} highlightLast />
      </Card>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1, gap: 8 }}>
          <Icon name="flame" color={t.flame} fill={t.flame + '33'} />
          <T v="mono">Серия</T>
          <T v="title">{daysShort(streak)}</T>
        </Card>
        <Card style={{ flex: 1, gap: 8 }} onPress={() => nav.navigate('Progress')}>
          <Icon name="diamond" color={t.accent} fill={t.accent + '33'} />
          <T v="mono">До след. стадии</T>
          <T v="title">{pct}%</T>
          <ProgressBar value={pct / 100} height={6} />
        </Card>
      </View>
    </Screen>
  );
}

function lowerFirst(s: string, apply: boolean) {
  return apply ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}
