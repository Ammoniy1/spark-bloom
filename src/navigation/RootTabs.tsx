import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/tokens';
import Icon, { type IconName } from '@/components/Icon';
import HomeScreen from '@/screens/HomeScreen';
import ProgressScreen from '@/screens/ProgressScreen';
import ActivityScreen from '@/screens/ActivityScreen';
import CustomizeScreen from '@/screens/CustomizeScreen';
import MoreScreen from '@/screens/MoreScreen';

export type TabParamList = {
  Home: undefined;
  Progress: undefined;
  Activity: undefined;
  Customize: undefined;
  More: { section?: 'companion' | 'widgets' | 'settings' } | undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, IconName> = {
  Home: 'home',
  Progress: 'progress',
  Activity: 'activity',
  Customize: 'customize',
  More: 'more',
};

export default function RootTabs() {
  const { t } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.textDim,
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: t.tabbarBg,
          borderTopColor: t.divider,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
        },
        tabBarIcon: ({ color }) => <Icon name={ICONS[route.name]} color={color} size={22} />,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Customize" component={CustomizeScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
