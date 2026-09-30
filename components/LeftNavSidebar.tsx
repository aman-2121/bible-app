import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';

interface LeftNavSidebarProps {
  onClose?: () => void;
}

export default function LeftNavSidebar({ onClose }: LeftNavSidebarProps) {
  const { language, theme } = useBible();
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const pathname = usePathname();
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'home', route: '/(tabs)', label: language === 'am' ? 'መነሻ' : 'Home', icon: 'home' },
    { id: 'bible', route: '/(tabs)', label: language === 'am' ? 'መጽሐፍ ቅዱስ' : 'Bible', icon: 'book' },
    { id: 'search', route: '/(tabs)/search', label: language === 'am' ? 'ፍለጋ' : 'Search', icon: 'search' },
    { id: 'plans', route: '/(tabs)/plans', label: language === 'am' ? 'ዕቅዶች' : 'Plans', icon: 'calendar-outline' },
    { id: 'journal', route: '/(tabs)/journal', label: language === 'am' ? 'ማስታወሻ' : 'Journal', icon: 'create-outline' },
    { id: 'bookmarks', route: '/(tabs)/bookmarks', label: language === 'am' ? 'ተወዳጆች' : 'Bookmarks', icon: 'bookmark-outline' },
    { id: 'daily', route: '/(tabs)/daily', label: language === 'am' ? 'ዕለታዊ መና' : 'Daily Manna', icon: 'sunny-outline' },
    { id: 'stats', route: '/stats', label: language === 'am' ? 'የንባብ ጉዞዬ' : 'Statistics', icon: 'bar-chart-outline' },
  ];

  const handleNav = (route: string) => {
    if (onClose) onClose();
    router.push(route as any);
  };

  return (
    <View style={[styles.sidebar, { backgroundColor: surfaceColor, borderRightColor: borderColor }]}>
      {/* Brand Header with Close Button */}
      <View style={styles.brandRow}>
        <View style={styles.brandLeft}>
          <View style={styles.crossCircle}>
            <Text style={styles.crossSymbol}>✝️</Text>
          </View>
          <View>
            <Text style={[styles.brandTitle, { color: textColor }]}>81 መጽሐፍ ቅዱስ</Text>
            <Text style={[styles.brandSubtitle, { color: textColor + '88' }]}>Ethiopian Orthodox Bible</Text>
          </View>
        </View>

        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)' }]}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={textColor + 'aa'} />
          </TouchableOpacity>
        )}
      </View>

      {/* Nav List */}
      <View style={styles.navList}>
        {navItems.map(item => {
          const isActive = (item.id === 'home' && (pathname === '/' || pathname === '/(tabs)')) || pathname.includes(item.id);

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                isActive && styles.activeNavItem,
              ]}
              onPress={() => handleNav(item.route)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={item.icon as any}
                size={18}
                color={isActive ? '#080f21' : textColor + '99'}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: isActive ? '#080f21' : textColor + 'cc' },
                  isActive && { fontWeight: '800' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Ge'ez Watermark Footer */}
      <View style={[styles.footerWrapper, { borderTopColor: borderColor }]}>
        <Text style={styles.footerCross}>✝️</Text>
        <Text style={styles.footerAmharic}>በእግዚአብሔር ጸጋ</Text>
        <Text style={[styles.footerEnglish, { color: textColor + '77' }]}>By God's Grace</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 18,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  crossSymbol: {
    fontSize: 18,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '500',
  },
  navList: {
    gap: 4,
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  activeNavItem: {
    backgroundColor: '#e5a93c',
  },
  navLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  footerWrapper: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 2,
  },
  footerCross: {
    fontSize: 14,
    marginBottom: 2,
  },
  footerAmharic: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e5a93c',
    letterSpacing: 0.3,
  },
  footerEnglish: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
