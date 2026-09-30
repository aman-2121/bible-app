import { Colors } from '@/constants/theme';
import { useBible } from '@/context/BibleContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const systemColorScheme = useColorScheme();
  const { theme } = useBible();
  
  let activeTheme: 'light' | 'dark' = 'light';
  if (theme === 'dark') {
    activeTheme = 'dark';
  } else if (theme === 'light') {
    activeTheme = 'light';
  } else {
    // If 'system' or undefined, use systemColorScheme
    activeTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
  }
  
  const colorFromProps = props[activeTheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[activeTheme]?.[colorName] ?? Colors.light[colorName];
  }
}

