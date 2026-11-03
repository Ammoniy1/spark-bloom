import React from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import RootTabs from '@/navigation/RootTabs';
import OnboardingScreen from '@/screens/OnboardingScreen';
import { CharacterModalProvider } from '@/components/Character';

export default function App() {
  const hydrated = useAppStore(s => s.hydrated);
  const onboarded = useAppStore(s => s.onboarded);
  const { name, t } = useTheme();

  const navTheme = {
    ...(name === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(name === 'dark' ? DarkTheme : DefaultTheme).colors,
      background: t.bg1,
      card: t.bg1,
      text: t.text,
      primary: t.accent,
      border: t.divider,
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={name === 'dark' ? 'light-content' : 'dark-content'} />
      {!hydrated ? (
        <View style={{ flex: 1, backgroundColor: t.bg1, justifyContent: 'center' }}>
          <ActivityIndicator color={t.accent} />
        </View>
      ) : onboarded ? (
        <CharacterModalProvider>
          <NavigationContainer theme={navTheme}>
            <RootTabs />
          </NavigationContainer>
        </CharacterModalProvider>
      ) : (
        <OnboardingScreen />
      )}
    </SafeAreaProvider>
  );
}
