import React, { createContext, useCallback, useContext, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { characterImage, duckImage, DUCK_PLACEMENT } from '@/lib/assets';
import {
  STAGES,
  STAGE_TITLE,
  getEmotion,
  getStage,
  type Emotion,
  type Stage,
} from '@/lib/sparkLogic';
import { MOOD_RU, PHRASES } from '@/lib/texts';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import Icon from './Icon';
import { T } from './ui';

/** Персонаж (картинка 2:3) + уточка-слой + мягкое свечение позади. */
export function CharacterView({
  height,
  stage,
  emotion,
  glow = true,
  onPress,
}: {
  height: number;
  stage: Stage;
  emotion: Emotion;
  glow?: boolean;
  onPress?: () => void;
}) {
  const width = height * (2 / 3);
  const duck = duckImage(stage, emotion);
  const place = DUCK_PLACEMENT[stage];
  const duckSize = width * place.size * 1.5;
  const body = (
    <View style={{ width, height }}>
      {glow && <Halo />}
      <Image
        source={characterImage(stage, emotion)}
        style={{ width, height }}
        resizeMode="contain"
        accessibilityLabel={`Персонаж: ${STAGE_TITLE[stage]}, ${MOOD_RU[emotion]}`}
      />
      {duck && (
        <Image
          source={duck}
          resizeMode="contain"
          style={{
            position: 'absolute',
            width: duckSize,
            height: duckSize,
            left: width * place.x - duckSize / 2,
            top: height * place.y - duckSize / 2,
          }}
        />
      )}
    </View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityHint="Открыть персонажа">
      {body}
    </Pressable>
  );
}

function Halo() {
  const { t } = useTheme();
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="halo" cx="50%" cy="38%" rx="50%" ry="42%">
          <Stop offset="0" stopColor="#ffc95c" stopOpacity={0.22} />
          <Stop offset="0.6" stopColor={t.accent} stopOpacity={0.06} />
          <Stop offset="1" stopColor={t.accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#halo)" />
    </Svg>
  );
}

/** Текущее состояние из стора. */
export function useCompanion() {
  const steps = useAppStore(s => s.steps);
  const streak = useAppStore(s => s.streak);
  return { stage: getStage(streak), emotion: getEmotion(steps), steps, streak };
}

/** Персонаж из стора, по тапу — полноэкранный просмотр. */
export function Companion({ height }: { height: number }) {
  const { stage, emotion } = useCompanion();
  const open = useCharacterModal();
  return <CharacterView height={height} stage={stage} emotion={emotion} onPress={open} />;
}

// --- Полноэкранный просмотр ---

const Ctx = createContext<() => void>(() => {});
export const useCharacterModal = () => useContext(Ctx);

export function CharacterModalProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  return (
    <Ctx.Provider value={open}>
      {children}
      <CharacterModal visible={visible} onClose={() => setVisible(false)} />
    </Ctx.Provider>
  );
}

function CharacterModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useTheme();
  const { stage, emotion } = useCompanion();
  const n = STAGES.indexOf(stage) + 1;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(5,7,4,0.92)' }]}
        onPress={onClose}>
        <View style={styles.modal}>
          <Pressable onPress={onClose} style={styles.close} hitSlop={12} accessibilityLabel="Закрыть">
            <Icon name="close" color="#eef1ea" />
          </Pressable>
          <CharacterView height={330} stage={stage} emotion={emotion} />
          <View
            style={[styles.badge, { borderColor: t.accent + '66', backgroundColor: t.accent + '1f' }]}>
            <T v="mono" color={t.accent}>
              {`Stage ${n} · ${STAGE_TITLE[stage]}`}
            </T>
          </View>
          <T v="display" color="#eef1ea" style={{ textAlign: 'center' }}>
            {MOOD_RU[emotion]}
          </T>
          <T color="#c9d2c3" style={{ textAlign: 'center', maxWidth: 300 }}>
            {PHRASES[emotion][0]}
          </T>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  close: { position: 'absolute', top: 56, right: 24 },
  badge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
});
