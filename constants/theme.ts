import { Platform } from 'react-native';

const tintColorLight = '#1e3a8a';
const tintColorDark = '#3b82f6';

export const Colors = {
  light: {
    text: '#091124',
    subtext: '#475569',
    background: '#f4f6fa',
    surface: '#ffffff',
    surfaceVariant: '#eaedf5',
    border: 'rgba(15, 23, 42, 0.08)',
    tint: '#e5a93c',
    gold: '#d4af37',
    goldBg: 'rgba(212, 175, 55, 0.15)',
    icon: '#475569',
    tabIconDefault: '#64748b',
    tabIconSelected: '#e5a93c',
    card: '#ffffff',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
  },
  dark: {
    text: '#f8fafc',
    subtext: '#94a3b8',
    background: '#070e1e',
    surface: '#0d172e',
    surfaceVariant: '#13203f',
    border: 'rgba(255, 255, 255, 0.08)',
    tint: '#e5a93c',
    gold: '#d4af37',
    goldBg: 'rgba(212, 175, 55, 0.15)',
    icon: '#94a3b8',
    tabIconDefault: '#64748b',
    tabIconSelected: '#e5a93c',
    card: '#0d172e',
    cardBorder: 'rgba(212, 175, 55, 0.18)',
  },
  sepia: {
    text: '#4a3728',
    subtext: '#786252',
    background: '#fbf7ee',
    surface: '#f4ecd8',
    surfaceVariant: '#ebe1c7',
    border: '#ded2b4',
    tint: '#8c6239',
    gold: '#b8860b',
    goldBg: '#fef3c7',
    icon: '#8c7851',
    tabIconDefault: '#a8987a',
    tabIconSelected: '#8c6239',
    card: '#f4ecd8',
    cardBorder: 'rgba(184, 134, 11, 0.2)',
  },
  system: {
    text: '#091124',
    subtext: '#475569',
    background: '#f4f6fa',
    surface: '#ffffff',
    surfaceVariant: '#eaedf5',
    border: 'rgba(15, 23, 42, 0.08)',
    tint: '#e5a93c',
    gold: '#d4af37',
    goldBg: 'rgba(212, 175, 55, 0.15)',
    icon: '#475569',
    tabIconDefault: '#64748b',
    tabIconSelected: '#e5a93c',
    card: '#ffffff',
    cardBorder: 'rgba(15, 23, 42, 0.08)',
  },
};

export const OrthodoxTheme = {
  gold: '#d4af37',
  goldBronze: '#c69214',
  deepNavy: '#1e3a8a',
  crimson: '#991b1b',
  parchment: '#fdf6e3',
  softGoldGradient: ['#c69214', '#eab308'],
  royalNavyGradient: ['#0f172a', '#1e3a8a'],
  orthodoxCross: '✝️',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
