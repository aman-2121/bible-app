import { Colors } from '@/constants/theme';
import { useBible } from '@/context/BibleContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // Use context-based theme for functional override
  const { theme } = useBible();
  const activeTheme = theme ?? 'light';
  
  const colorFromProps = props[activeTheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[activeTheme][colorName];
  }
}
