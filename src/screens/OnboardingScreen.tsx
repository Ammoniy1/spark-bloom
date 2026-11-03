import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Backdrop, Button, Card, T } from '@/components/ui';
import { CharacterView } from '@/components/Character';
import GoalEditor from '@/components/GoalEditor';
import Icon, { type IconName } from '@/components/Icon';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import { fonts, themes, type ThemeName } from '@/theme/tokens';

const STEPS = 6;

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTheme();
  const [step, setStep] = useState(0);
  const s = useAppStore();
  const next = () => setStep(v => Math.min(v + 1, STEPS - 1));
  const back = () => setStep(v => Math.max(v - 1, 0));

  const input = {
    backgroundColor: t.card,
    borderColor: t.cardBorder,
    color: t.text,
    fontFamily: fonts.body,
  };

  let content: React.ReactNode;
  let action: React.ReactNode;
  switch (step) {
    case 0:
      content = (
        <View style={styles.center}>
          <CharacterView height={300} stage="ember" emotion="happy" />
          <T v="display" style={styles.c}>Spark Bloom</T>
          <T v="dim" style={[styles.c, { fontSize: 15, lineHeight: 22 }]}>
            Твой компаньон, который светится ярче с каждым шагом. Ходи каждый день — и
            увидишь, как из искры рождается сияние.
          </T>
        </View>
      );
      action = <Button label="Начать" onPress={next} />;
      break;
    case 1:
      content = (
        <View style={{ gap: 14 }}>
          <T v="display">Создай профиль</T>
          <T v="dim">Так компаньон будет знать, как к тебе обращаться.</T>
          <T v="mono" style={{ marginTop: 8 }}>Имя</T>
          <TextInput
            value={s.name}
            onChangeText={s.setName}
            placeholder="Как тебя зовут?"
            placeholderTextColor={t.textDim}
            style={[styles.input, input]}
            autoFocus
            returnKeyType="next"
          />
          <T v="mono">Email · необязательно</T>
          <TextInput
            value={s.email}
            onChangeText={s.setEmail}
            placeholder="name@example.com"
            placeholderTextColor={t.textDim}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, input]}
          />
        </View>
      );
      action = <Button label="Дальше" onPress={next} disabled={!s.name.trim()} />;
      break;
    case 2:
      content = (
        <View style={{ gap: 14 }}>
          <T v="display">Внешний вид</T>
          <T v="dim">Тему можно поменять позже в настройках.</T>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            {(['dark', 'light'] as ThemeName[]).map(name => (
              <ThemeCard key={name} name={name} on={s.theme === name} onPress={() => s.setTheme(name)} />
            ))}
          </View>
        </View>
      );
      action = <Button label="Дальше" onPress={next} />;
      break;
    case 3:
      content = (
        <View style={{ gap: 14 }}>
          <T v="display">Дневная цель</T>
          <T v="dim">Выполняй цель каждый день — так растёт серия и разгорается свет.</T>
          <Card style={{ marginTop: 8 }}>
            <GoalEditor value={s.goal} onChange={s.setGoal} />
          </Card>
        </View>
      );
      action = <Button label="Дальше" onPress={next} />;
      break;
    case 4:
      content = (
        <View style={{ gap: 14 }}>
          <T v="display">Коротко о главном</T>
          <Point icon="spark" title="Путь света"
            text="5 стадий: Ember, Spark, Glow, Blaze, Nova. Каждый день с выполненной целью продлевает серию, пропуск — обнуляет." />
          <Point icon="chat" title="Твой компаньон"
            text="Его настроение зависит от шагов за сегодня: от грустного до полного энергии." />
          <Point icon="widget" title="Виджет на экране"
            text="Добавь виджет Spark Bloom на главный экран, чтобы видеть компаньона без входа в приложение." />
        </View>
      );
      action = <Button label="Дальше" onPress={next} />;
      break;
    default:
      content = (
        <View style={styles.center}>
          <CharacterView height={300} stage="spark" emotion="energetic" />
          <T v="display" style={styles.c}>{`Всё готово, ${s.name.trim()}!`}</T>
          <T v="dim" style={[styles.c, { fontSize: 15 }]}>
            Цель на день — {s.goal.toLocaleString('ru-RU')} шагов. Пойдём?
          </T>
        </View>
      );
      action = <Button label="Перейти в приложение" onPress={s.finishOnboarding} />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Backdrop />
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={back}
          disabled={step === 0}
          hitSlop={10}
          style={{ opacity: step === 0 ? 0 : 1 }}
          accessibilityLabel="Назад">
          <Icon name="back" color={t.text} />
        </Pressable>
        <View style={{ flex: 1, flexDirection: 'row', gap: 6 }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i <= step ? t.accent : t.divider,
              }}
            />
          ))}
        </View>
        <View style={{ width: 22 }} />
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 22, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled">
        {content}
      </ScrollView>
      <View style={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 16 }}>{action}</View>
    </KeyboardAvoidingView>
  );
}

function ThemeCard({ name, on, onPress }: { name: ThemeName; on: boolean; onPress: () => void }) {
  const { t } = useTheme();
  const p = themes[name];
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: 22,
        padding: 12,
        gap: 10,
        borderWidth: 2,
        borderColor: on ? t.accent : t.cardBorder,
        backgroundColor: t.card,
      }}>
      <View style={{ height: 130, borderRadius: 14, backgroundColor: p.bg1, padding: 10, gap: 8 }}>
        <View style={{ height: 50, borderRadius: 10, backgroundColor: p.bg2, borderWidth: 1, borderColor: p.cardBorder }} />
        <View style={{ height: 10, width: '70%', borderRadius: 5, backgroundColor: p.text, opacity: 0.8 }} />
        <View style={{ height: 8, width: '45%', borderRadius: 4, backgroundColor: p.textDim }} />
        <View style={{ height: 16, width: '55%', borderRadius: 8, backgroundColor: p.accent, marginTop: 'auto' }} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T style={{ fontWeight: '600' }}>{name === 'dark' ? 'Тёмная' : 'Светлая'}</T>
        {on && <Icon name="check" color={t.accent} size={18} />}
      </View>
    </Pressable>
  );
}

function Point({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  const { t } = useTheme();
  return (
    <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
      <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: t.accent + '22', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} color={t.accent} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <T v="h2">{title}</T>
        <T v="dim">{text}</T>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 14 },
  c: { textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
});
