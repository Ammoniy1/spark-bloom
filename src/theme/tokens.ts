import { Platform } from 'react-native';

export type ThemeName = 'dark' | 'light';

export interface ThemeTokens {
  bg1: string;
  bg2: string;
  card: string;
  card2: string;
  cardBorder: string;
  text: string;
  textDim: string;
  divider: string;
  accent: string;
  accentInk: string;
  tabbarBg: string;
  flame: string;
}

export const themes: Record<ThemeName, ThemeTokens> = {
  dark: {
    bg1: '#0b0d09',
    bg2: '#141a10',
    card: 'rgba(255,255,255,0.055)',
    card2: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(255,255,255,0.09)',
    text: '#eef1ea',
    textDim: '#93a08d',
    divider: 'rgba(255,255,255,0.09)',
    accent: '#8bc543',
    accentInk: '#16210a',
    tabbarBg: 'rgba(9,11,7,0.86)',
    flame: '#ff9d4d',
  },
  light: {
    bg1: '#f3f6ee',
    bg2: '#ffffff',
    card: '#ffffff',
    card2: '#f7f9f3',
    cardBorder: '#e8ece0',
    text: '#1c2016',
    textDim: '#77816e',
    divider: '#edf0e6',
    accent: '#5f9c2c',
    accentInk: '#ffffff',
    tabbarBg: 'rgba(255,255,255,0.92)',
    flame: '#e8832c',
  },
};

// Целевые шрифты. Файлы .ttf нужно положить в assets/fonts и слинковать
// (npx react-native-asset). До этого используется системный шрифт.
// Переключить в true после линковки шрифтов: на iOS неизвестное семейство даёт ошибку в консоли.
const FONTS_LINKED = false;

export const fonts = {
  display: FONTS_LINKED ? 'Outfit' : undefined,
  body: FONTS_LINKED ? 'Inter' : undefined,
  mono: FONTS_LINKED ? 'JetBrainsMono-Regular' : Platform.select({ ios: 'Menlo', default: 'monospace' }),
};
