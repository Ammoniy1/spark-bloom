import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Button, Card, Divider, Row, Screen, Segmented, T, TopBar } from '@/components/ui';
import { CharacterView, useCharacterModal, useCompanion } from '@/components/Character';
import GoalEditor from '@/components/GoalEditor';
import Icon from '@/components/Icon';
import { fmt } from '@/lib/format';
import { STAGE_TITLE, progressPct } from '@/lib/sparkLogic';
import { PHRASES } from '@/lib/texts';
import { useAppStore, type DataSource } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import { themes, type ThemeName } from '@/theme/tokens';
import type { TabParamList } from '@/navigation/RootTabs';
import DebugPanel from './DebugPanel';

type Section = 'companion' | 'widgets' | 'settings' | 'debug';

const TIMES = ['7:00', '8:00', '9:00', '10:00', '19:00', '20:00', '21:00'];
const ACTIVITY = [30, 45, 60, 90, 120];
const SOURCES: DataSource[] = ['Apple Health', 'Google Fit', 'Вручную'];
const cycle = <T,>(arr: T[], v: T) => arr[(arr.indexOf(v) + 1) % arr.length];

export default function MoreScreen() {
  const route = useRoute<RouteProp<TabParamList, 'More'>>();
  const nav = useNavigation();
  const [section, setSection] = useState<Section | undefined>(route.params?.section);
  const [taps, setTaps] = useState(0);

  useEffect(() => {
    setSection(route.params?.section);
  }, [route.params]);

  const titles: Record<Section, string> = {
    companion: 'Companion',
    widgets: 'Widgets',
    settings: 'Settings',
    debug: 'Разработка',
  };

  const backToRoot = () => {
    setSection(undefined);
    nav.setParams({ section: undefined } as never);
  };

  if (!section) {
    return (
      <Screen top={<TopBar title="More" />}>
        <Card style={{ paddingVertical: 4 }}>
          <Row icon="chat" title="Companion" value="Сообщения от Spark Bloom" onPress={() => setSection('companion')} />
          <Divider />
          <Row icon="widget" title="Widgets Preview" value="На главном экране" onPress={() => setSection('widgets')} />
          <Divider />
          <Row icon="settings" title="Settings" onPress={() => setSection('settings')} />
        </Card>
        <Pressable
          onPress={() => {
            const n = taps + 1;
            setTaps(n);
            if (n >= 5) {
              setTaps(0);
              setSection('debug');
            }
          }}>
          <T v="mono" style={{ textAlign: 'center', marginTop: 8 }}>Spark Bloom 1.0.0</T>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen top={<TopBar title={titles[section]} left={{ icon: 'back', label: 'Назад', onPress: backToRoot }} />}>
      {section === 'companion' && <CompanionSection />}
      {section === 'widgets' && <WidgetsSection />}
      {section === 'settings' && <SettingsSection />}
      {section === 'debug' && <DebugPanel />}
    </Screen>
  );
}

function CompanionSection() {
  const { t } = useTheme();
  const { stage, emotion } = useCompanion();
  const open = useCharacterModal();
  const time = useAppStore(s => s.messageTime);
  const setSettings = useAppStore(s => s.setSettings);
  const [phrase, setPhrase] = useState(PHRASES[emotion][0]);
  useEffect(() => setPhrase(PHRASES[emotion][0]), [emotion]);

  return (
    <>
      <Card style={{ gap: 6 }}>
        <T style={{ fontSize: 17, lineHeight: 24 }}>{phrase}</T>
        <T v="mono">— Spark Bloom</T>
      </Card>
      <View style={{ alignItems: 'center' }}>
        <CharacterView height={240} stage={stage} emotion={emotion} onPress={open} />
      </View>
      <Pressable onPress={() => setSettings({ messageTime: cycle(TIMES, time) })}>
        <T v="dim" style={{ textAlign: 'center' }}>
          Каждый день в {time} · <T v="dim" color={t.accent}>Изменить</T>
        </T>
      </Pressable>
      <Button
        label="Поговорить с Bloom"
        onPress={() => {
          const list = PHRASES[emotion].filter(p => p !== phrase);
          setPhrase(list[Math.floor(Math.random() * list.length)]);
        }}
      />
    </>
  );
}

function WidgetsSection() {
  const [size, setSize] = useState<'s' | 'm' | 'l'>('m');
  return (
    <>
      <Segmented
        value={size}
        onChange={setSize}
        options={[
          { key: 's', label: '2×2' },
          { key: 'm', label: '4×2' },
          { key: 'l', label: '4×4' },
        ]}
      />
      <View style={{ alignItems: 'center', paddingVertical: 12 }}>
        <WidgetMock size={size} />
      </View>
      <Card soft style={{ flexDirection: 'row', gap: 10 }}>
        <T v="dim" style={{ flex: 1 }}>
          Долгое нажатие на главном экране → «Добавить виджет» → Spark Bloom.
        </T>
      </Card>
    </>
  );
}

/** Макет виджета — повторяет то, что рисуют нативные виджеты. */
export function WidgetMock({ size }: { size: 's' | 'm' | 'l' }) {
  const theme = useAppStore(s => s.theme);
  const p = themes[theme];
  const { stage, emotion, steps, streak } = useCompanion();
  const pct = progressPct(streak);
  const dims = { s: [158, 158], m: [330, 158], l: [330, 330] }[size];
  const bar = <ProgressBarStatic value={pct / 100} accent={p.accent} track={p.divider} />;
  return (
    <View
      style={{
        width: dims[0],
        height: dims[1],
        borderRadius: 24,
        backgroundColor: p.bg2,
        borderWidth: 1,
        borderColor: p.cardBorder,
        padding: 14,
        overflow: 'hidden',
      }}>
      {size === 's' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-between' }}>
          <CharacterView height={100} stage={stage} emotion={emotion} glow={false} />
          <View style={{ alignSelf: 'stretch' }}>{bar}</View>
        </View>
      )}
      {size === 'm' && (
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <CharacterView height={128} stage={stage} emotion={emotion} glow={false} />
          <View style={{ flex: 1, gap: 8 }}>
            <T v="title" color={p.text}>{STAGE_TITLE[stage]}</T>
            <T v="h2" color={p.accent}>{pct}%</T>
            {bar}
          </View>
        </View>
      )}
      {size === 'l' && (
        <View style={{ flex: 1, alignItems: 'center', gap: 10 }}>
          <CharacterView height={170} stage={stage} emotion={emotion} glow={false} />
          <View style={{ alignSelf: 'stretch', gap: 8 }}>
            <Line icon="diamond" color={p.accent} text={`${fmt(steps)} шагов сегодня`} textColor={p.text} />
            <Line icon="flame" color={p.flame} text={`${streak} дней подряд`} textColor={p.text} />
            <Line icon="spark" color={p.accent} text={`${pct}% до след. стадии`} textColor={p.text} />
          </View>
        </View>
      )}
    </View>
  );
}

function Line({ icon, color, text, textColor }: { icon: 'diamond' | 'flame' | 'spark'; color: string; text: string; textColor: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Icon name={icon} color={color} fill={color + '33'} size={16} />
      <T color={textColor} style={{ fontWeight: '600' }}>{text}</T>
    </View>
  );
}

function ProgressBarStatic({ value, accent, track }: { value: number; accent: string; track: string }) {
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(value * 100)}%`, height: '100%', backgroundColor: accent, borderRadius: 3 }} />
    </View>
  );
}

function SettingsSection() {
  const { t } = useTheme();
  const s = useAppStore();
  const [goalOpen, setGoalOpen] = useState(false);

  return (
    <>
      <T v="mono">Дневная цель</T>
      <Card style={{ paddingVertical: 4 }}>
        <Row icon="walk" title="Цель по шагам" value={fmt(s.goal)} onPress={() => setGoalOpen(o => !o)} />
        {goalOpen && (
          <View style={{ paddingBottom: 14 }}>
            <GoalEditor value={s.goal} onChange={s.setGoal} />
          </View>
        )}
        <Divider />
        <Row
          icon="clock"
          title="Цель по активности"
          value={`${s.activityGoalMin} мин`}
          onPress={() => s.setSettings({ activityGoalMin: cycle(ACTIVITY, s.activityGoalMin) })}
        />
      </Card>

      <T v="mono">Уведомления</T>
      <Card style={{ paddingVertical: 4 }}>
        <Row
          icon="bell"
          title="Сообщения компаньона"
          right={
            <Switch
              value={s.notificationsOn}
              onValueChange={v => s.setSettings({ notificationsOn: v })}
              trackColor={{ true: t.accent, false: t.divider }}
            />
          }
        />
        <Divider />
        <Row
          icon="chat"
          title="Время сообщения"
          value={s.messageTime}
          onPress={() => s.setSettings({ messageTime: cycle(TIMES, s.messageTime) })}
        />
        <Divider />
        <Row
          icon="activity"
          title="Источник данных"
          value={s.dataSource}
          onPress={() => s.setSettings({ dataSource: cycle(SOURCES, s.dataSource) })}
        />
      </Card>

      <T v="mono">Внешний вид</T>
      <Segmented<ThemeName>
        value={s.theme}
        onChange={s.setTheme}
        options={[
          { key: 'dark', label: 'Тёмная' },
          { key: 'light', label: 'Светлая' },
        ]}
      />

      <T v="mono">Данные</T>
      <Button
        kind="danger"
        label="Сбросить данные и выйти"
        onPress={() =>
          Alert.alert('Сбросить всё?', 'Имя, цель, серия и шаги будут удалены.', [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Сбросить', style: 'destructive', onPress: s.resetAll },
          ])
        }
      />

      <T v="mono">Прочее</T>
      <Card style={{ paddingVertical: 4 }}>
        <Row
          title="Конфиденциальность"
          onPress={() => Alert.alert('Конфиденциальность', 'Политика появится перед публичным запуском.')}
        />
        <Divider />
        <Row title="О Spark Bloom" value="1.0.0" />
      </Card>
    </>
  );
}
