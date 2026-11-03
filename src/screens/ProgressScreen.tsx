import React from 'react';
import { Share, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, ProgressBar, Screen, T, TopBar } from '@/components/ui';
import { CharacterView, useCharacterModal, useCompanion } from '@/components/Character';
import Icon from '@/components/Icon';
import { daysWord, fmt } from '@/lib/format';
import {
  STAGES,
  STAGE_THRESHOLDS,
  STAGE_TITLE,
  getLevel,
  getNextStage,
  getStageProgress,
  xpFromProgress,
} from '@/lib/sparkLogic';
import { STAGE_DESC } from '@/lib/texts';
import { useTheme } from '@/theme/useTheme';

export default function ProgressScreen() {
  const nav = useNavigation();
  const { t } = useTheme();
  const open = useCharacterModal();
  const { stage, emotion, streak } = useCompanion();
  const idx = STAGES.indexOf(stage);
  const next = getNextStage(streak);
  const prog = getStageProgress(streak);

  const share = () =>
    Share.share({
      message: `Я на стадии ${STAGE_TITLE[stage]} в Spark Bloom, серия ${streak} ${daysWord(streak)} подряд! ✨`,
    });

  return (
    <Screen
      top={
        <TopBar
          title="Progress"
          left={{ icon: 'back', label: 'Назад', onPress: () => nav.navigate('Home' as never) }}
          right={{ icon: 'share', label: 'Поделиться', onPress: share }}
        />
      }>
      {/* Путь из 5 узлов */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {STAGES.map((s, i) => {
            const done = i <= idx;
            return (
              <React.Fragment key={s}>
                {i > 0 && (
                  <View style={{ flex: 1, height: 3, backgroundColor: i <= idx ? t.accent : t.divider }} />
                )}
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: done ? t.accent : t.card2,
                    borderWidth: 2,
                    borderColor: done ? t.accent : t.divider,
                  }}>
                  {i < idx ? (
                    <Icon name="check" color={t.accentInk} size={14} />
                  ) : i === idx ? (
                    <Icon name="spark" color={t.accentInk} fill={t.accentInk} size={12} />
                  ) : null}
                </View>
              </React.Fragment>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          {STAGES.map((s, i) => (
            <T
              key={s}
              v="dim"
              style={{ fontSize: 11, width: 44, textAlign: 'center', marginHorizontal: -9, fontWeight: i === idx ? '800' : '400' }}
              color={i === idx ? t.text : undefined}>
              {STAGE_TITLE[s]}
            </T>
          ))}
        </View>
      </Card>

      {/* Кристалл */}
      <View style={{ alignItems: 'center', gap: 10, paddingVertical: 6 }}>
        <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              position: 'absolute',
              width: 140,
              height: 140,
              borderRadius: 30,
              transform: [{ rotate: '45deg' }],
              backgroundColor: t.accent,
              opacity: 0.16,
            }}
          />
          <CharacterView height={190} stage={stage} emotion={emotion} glow={false} onPress={open} />
        </View>
        <T v="display">{STAGE_TITLE[stage]}</T>
        <T v="mono">{`Level ${getLevel(streak)} · серия ${streak} ${daysWord(streak)}`}</T>
        <T v="dim" style={{ textAlign: 'center' }}>{STAGE_DESC[stage]}</T>
      </View>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <T v="h2">{next ? `До ${STAGE_TITLE[next]}` : 'Максимальная стадия'}</T>
          <T v="h2" color={t.accent}>{Math.round(prog * 100)}%</T>
        </View>
        <ProgressBar value={prog} />
        <T v="mono">{`${fmt(xpFromProgress(streak))} / ${fmt(3000)} XP`}</T>
      </Card>

      <Card soft style={{ flexDirection: 'row', gap: 12 }}>
        <Icon name="spark" color={t.accent} />
        <View style={{ flex: 1, gap: 4 }}>
          <T v="h2">{next ? `Дальше: ${STAGE_TITLE[next]}` : 'Ты на вершине'}</T>
          <T v="dim">
            {next
              ? prog >= 0.75
                ? 'Ты почти на пороге новой стадии!'
                : `Нужно ${STAGE_THRESHOLDS[next] - streak} ${daysWord(STAGE_THRESHOLDS[next] - streak)} с выполненной целью. Продолжай в том же духе!`
              : 'Держи серию, чтобы сияние не угасло.'}
          </T>
        </View>
      </Card>
    </Screen>
  );
}
