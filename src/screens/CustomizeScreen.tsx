import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Screen, T, TopBar } from '@/components/ui';
import { CharacterView, useCharacterModal, useCompanion } from '@/components/Character';
import Icon from '@/components/Icon';
import { fmt } from '@/lib/format';
import { useTheme } from '@/theme/useTheme';

const CATS = ['Outfit', 'Shoes', 'Bag', 'Chain', 'Accessory'];

/** Раздел в разработке: превью-заглушка. */
export default function CustomizeScreen() {
  const nav = useNavigation();
  const { t } = useTheme();
  const open = useCharacterModal();
  const { stage, emotion } = useCompanion();
  const [cat, setCat] = useState(CATS[0]);

  return (
    <Screen
      top={
        <TopBar
          title="Customize"
          left={{ icon: 'back', label: 'Назад', onPress: () => nav.navigate('Home' as never) }}
          right={{
            icon: 'dots',
            label: 'Ещё',
            onPress: () => Alert.alert('Скоро', 'Это появится в одном из следующих обновлений.'),
          }}
        />
      }>
      <Card soft>
        <T v="dim">🚧 Раздел в разработке — скоро здесь можно будет переодеть компаньона.</T>
      </Card>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
        <Currency icon="diamond" value={1450} />
        <Currency icon="spark" value={24} />
      </View>
      <View style={{ alignItems: 'center' }}>
        <CharacterView height={200} stage={stage} emotion={emotion} onPress={open} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CATS.map(c => {
          const on = c === cat;
          return (
            <Pressable
              key={c}
              onPress={() => setCat(c)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: on ? t.accent : t.card,
                borderWidth: 1,
                borderColor: on ? t.accent : t.cardBorder,
              }}>
              <T color={on ? t.accentInk : t.text} style={{ fontWeight: '600' }}>{c}</T>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={{
              width: '31%',
              aspectRatio: 1,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: i === 0 ? t.accent + '22' : t.card2,
              borderWidth: 1.5,
              borderColor: i === 0 ? t.accent : t.cardBorder,
              opacity: i === 0 ? 1 : 0.6,
            }}>
            <Icon name={i === 0 ? 'check' : 'lock'} color={i === 0 ? t.accent : t.textDim} />
            {i > 0 && <T v="mono">{fmt(120 * i)}</T>}
          </View>
        ))}
      </View>
    </Screen>
  );

  function Currency({ icon, value }: { icon: 'diamond' | 'spark'; value: number }) {
    return (
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 }}>
        <Icon name={icon} color={icon === 'diamond' ? t.accent : t.flame} fill={(icon === 'diamond' ? t.accent : t.flame) + '33'} size={16} />
        <T style={{ fontWeight: '700' }}>{fmt(value)}</T>
      </Card>
    );
  }
}
