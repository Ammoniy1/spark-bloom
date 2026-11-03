import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/tokens';
import Icon, { type IconName } from './Icon';

/** Фон: радиальный градиент bg2 → bg1. */
export function Backdrop() {
  const { t } = useTheme();
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="bg" cx="50%" cy="22%" rx="85%" ry="60%">
          <Stop offset="0" stopColor={t.bg2} />
          <Stop offset="1" stopColor={t.bg1} />
        </RadialGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#bg)" />
    </Svg>
  );
}

export function Screen({
  children,
  scroll = true,
  top,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  top?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const { t } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg1, paddingTop: insets.top }}>
      <Backdrop />
      {top}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[{ padding: 18, paddingBottom: 32, gap: 14 }, contentStyle]}
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1, padding: 18, gap: 14 }, contentStyle]}>{children}</View>
      )}
    </View>
  );
}

type Variant = 'display' | 'title' | 'h2' | 'body' | 'dim' | 'mono' | 'big';

export function T({
  v = 'body',
  style,
  color,
  ...rest
}: TextProps & { v?: Variant; color?: string }) {
  const { t } = useTheme();
  const base: Record<Variant, object> = {
    big: { fontFamily: fonts.display, fontSize: 44, fontWeight: '800', letterSpacing: -1, color: t.text },
    display: { fontFamily: fonts.display, fontSize: 30, fontWeight: '800', letterSpacing: -0.5, color: t.text },
    title: { fontFamily: fonts.display, fontSize: 20, fontWeight: '700', color: t.text },
    h2: { fontFamily: fonts.display, fontSize: 16, fontWeight: '700', color: t.text },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: t.text },
    dim: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: t.textDim },
    mono: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: t.textDim },
  };
  return <Text {...rest} style={[base[v], color ? { color } : null, style]} />;
}

export function Card({
  children,
  style,
  onPress,
  soft,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  soft?: boolean;
}) {
  const { t } = useTheme();
  const s = [
    {
      backgroundColor: soft ? t.card2 : t.card,
      borderColor: t.cardBorder,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderRadius: 22,
      padding: 16,
    },
    style,
  ];
  if (!onPress) return <View style={s}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s, pressed && { opacity: 0.85 }]}>
      {children}
    </Pressable>
  );
}

export function TopBar({
  title,
  left,
  right,
}: {
  title?: string;
  left?: { icon: IconName; onPress: () => void; label: string };
  right?: { icon: IconName; onPress: () => void; label: string };
}) {
  const { t } = useTheme();
  const btn = (b?: { icon: IconName; onPress: () => void; label: string }) =>
    b ? (
      <Pressable
        accessibilityLabel={b.label}
        hitSlop={10}
        onPress={b.onPress}
        style={({ pressed }) => [
          styles.barBtn,
          { backgroundColor: t.card, borderColor: t.cardBorder },
          pressed && { opacity: 0.7 },
        ]}>
        <Icon name={b.icon} color={t.text} size={20} />
      </Pressable>
    ) : (
      <View style={styles.barBtn} />
    );
  return (
    <View style={styles.bar}>
      {btn(left)}
      <T v="title" style={{ flex: 1, textAlign: 'center' }}>
        {title}
      </T>
      {btn(right)}
    </View>
  );
}

export function Button({
  label,
  onPress,
  disabled,
  kind = 'primary',
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  kind?: 'primary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useTheme();
  const bg = kind === 'primary' ? t.accent : 'transparent';
  const fg = kind === 'primary' ? t.accentInk : kind === 'danger' ? '#e5534b' : t.text;
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: 18,
          paddingVertical: 16,
          alignItems: 'center',
          borderWidth: kind === 'primary' ? 0 : 1,
          borderColor: kind === 'danger' ? '#e5534b55' : t.cardBorder,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      <Text style={{ color: fg, fontFamily: fonts.display, fontSize: 16, fontWeight: '700' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Segmented<K extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: K; label: string }[];
  value: K;
  onChange: (k: K) => void;
}) {
  const { t } = useTheme();
  return (
    <View style={[styles.seg, { backgroundColor: t.card2, borderColor: t.cardBorder }]}>
      {options.map(o => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            style={[styles.segItem, on && { backgroundColor: t.accent }]}>
            <Text
              style={{
                fontFamily: fonts.body,
                fontWeight: '600',
                fontSize: 14,
                color: on ? t.accentInk : t.textDim,
              }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressBar({ value, height = 10 }: { value: number; height?: number }) {
  const { t } = useTheme();
  return (
    <View style={{ height, borderRadius: height, backgroundColor: t.divider, overflow: 'hidden' }}>
      <View
        style={{
          width: `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%`,
          height: '100%',
          borderRadius: height,
          backgroundColor: t.accent,
        }}
      />
    </View>
  );
}

export function Row({
  icon,
  title,
  value,
  onPress,
  right,
}: {
  icon?: IconName;
  title: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const { t } = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      {icon && <Icon name={icon} color={t.accent} size={20} />}
      <T style={{ flex: 1 }}>{title}</T>
      {value ? <T v="dim">{value}</T> : null}
      {right ?? (onPress ? <Icon name="chevron" color={t.textDim} size={18} /> : null)}
    </Pressable>
  );
}

export function Divider() {
  const { t } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: t.divider }} />;
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 4,
    gap: 12,
  },
  barBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: 'transparent',
  },
  seg: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13 },
});
