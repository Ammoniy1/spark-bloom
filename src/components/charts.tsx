import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme/useTheme';
import { T } from './ui';

/** Кольцо активности: r=72, stroke 13, круглые концы, старт сверху. */
export function Ring({
  value,
  size = 164,
  children,
}: {
  value: number;
  size?: number;
  children?: React.ReactNode;
}) {
  const { t } = useTheme();
  const r = 72;
  const sw = 13;
  const c = 2 * Math.PI * r;
  const v = Math.min(Math.max(value, 0), 1);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 164 164" style={{ position: 'absolute' }}>
        <Circle cx={82} cy={82} r={r} stroke={t.divider} strokeWidth={sw} fill="none" />
        <Circle
          cx={82}
          cy={82}
          r={r}
          stroke={t.accent}
          strokeWidth={sw}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * v} ${c}`}
          transform="rotate(-90 82 82)"
        />
      </Svg>
      {children}
    </View>
  );
}

/** Столбики. highlightLast — подсветить последний (сегодня). */
export function Bars({
  values,
  height = 120,
  max,
  highlightLast,
  axis,
  goal,
}: {
  values: number[];
  height?: number;
  max?: number;
  highlightLast?: boolean;
  axis?: string[];
  goal?: number;
}) {
  const { t } = useTheme();
  const top = Math.max(max ?? 0, ...values, goal ?? 0, 1);
  const gap = values.length > 20 ? 2 : values.length > 12 ? 4 : 6;
  return (
    <View>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap }}>
        {goal ? (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: (goal / top) * height,
              borderTopWidth: 1,
              borderStyle: 'dashed',
              borderColor: t.textDim,
              opacity: 0.6,
            }}
          />
        ) : null}
        {values.map((v, i) => {
          const last = i === values.length - 1;
          const reached = goal ? v >= goal : false;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: Math.max(3, (v / top) * height),
                borderRadius: 6,
                backgroundColor:
                  highlightLast && last ? t.accent : reached ? t.accent + 'b0' : t.accent + '45',
              }}
            />
          );
        })}
      </View>
      {axis && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          {axis.map(a => (
            <T key={a} v="mono" style={{ fontSize: 10 }}>
              {a}
            </T>
          ))}
        </View>
      )}
    </View>
  );
}
