// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

// @ts-ignore Custom mappings not in SF type
const MAPPING = {
  'house.fill': 'home',
  'magnifyingglass': 'search',
  'bookmark.fill': 'bookmark',
  'sun.max.fill': 'wb_sunny',
  'book': 'menu-book',
  'heart.fill': 'favorite',
  'chevron.down': 'expand_more',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'list.bullet': 'format-list-bulleted',
  'pencil.and.outline': 'edit',
} as IconMapping;

type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name] || 'help'} style={style} />;
}
