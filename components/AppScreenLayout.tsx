import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import GlobalControls from '@/components/GlobalHeader';
import LeftNavSidebar from '@/components/LeftNavSidebar';

export interface AppScreenLayoutProps {
  title?: string;
  subtitle?: string;
  showBackBtn?: boolean;
  onBackPress?: () => void;
  rightContent?: React.ReactNode;
  showProfile?: boolean;
  headerRight?: React.ReactNode;
  floatingAction?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * AppScreenLayout — The unified, reusable application frame for all pages.
 *
 * Provides:
 * - Shared Top Header Bar with ☰ Hamburger Menu, Orthodox Cross ✝️, App Titles, and GlobalControls.
 * - Responsive Multi-Column Layout:
 *    • Left Column: LeftNavSidebar (Desktop/Tablet)
 *    • Center Column: Main Content (Full width by default)
 *    • Right Column: Rendered ONLY if page explicitly passes rightContent (e.g. Home Dashboard)
 * - Mobile Drawer Modal with backdrop and LeftNavSidebar.
 * - Consistent Dark/Night Mode (Primary reference, unchanged).
 * - Polished Light Mode (Soft off-white #f4f6fa, deep navy #091124, gold #e5a93c, subtle borders).
 */
export default function AppScreenLayout({
  title,
  subtitle,
  showBackBtn = false,
  onBackPress,
  rightContent,
  showProfile = true,
  headerRight,
  floatingAction,
  children,
}: AppScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWidescreen = width >= 1024;

  const { theme, language } = useBible();
  const isDark = theme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [sidebarOpen, setSidebarOpen] = useState(isWidescreen);

  useEffect(() => {
    setSidebarOpen(isWidescreen);
  }, [isWidescreen]);

  const defaultTitle = '81 መጽሐፍ ቅዱስ';
  const defaultSubtitle = language === 'am' ? 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ' : 'Ethiopian Orthodox Bible';

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  return (
    <View style={[styles.rootContainer, { backgroundColor, paddingTop: insets.top }]}>
      {/* 1. Global App Header */}
      <View style={[styles.topHeaderBar, { borderBottomColor: borderColor }]}>
        <View style={styles.brandRow}>
          {/* Back Button if navigating from a nested screen */}
          {showBackBtn && (
            <TouchableOpacity
              style={[
                styles.hamburgerBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.1)',
                },
              ]}
              onPress={onBackPress || (() => router.back())}
              activeOpacity={0.7}
              accessibilityLabel="Go Back"
            >
              <Ionicons name="arrow-back" size={20} color={isDark ? '#e5a93c' : '#091124'} />
            </TouchableOpacity>
          )}

          {/* Hamburger Menu Toggle (☰) */}
          <TouchableOpacity
            style={[
              styles.hamburgerBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.1)',
              },
            ]}
            onPress={() => setSidebarOpen(prev => !prev)}
            activeOpacity={0.7}
            accessibilityLabel="Toggle Menu"
          >
            <Ionicons
              name={sidebarOpen ? 'close' : 'menu'}
              size={22}
              color="#e5a93c"
            />
          </TouchableOpacity>

          {/* Orthodox Cross Badge */}
          <View style={styles.orthodoxCrossBadge}>
            <Text style={styles.crossEmoji}>✝️</Text>
          </View>

          {/* Titles */}
          <View style={styles.titleTextCol}>
            <Text style={[styles.appMainTitle, { color: textColor }]} numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text style={[styles.appSubTitle, { color: textColor + '88' }]} numberOfLines={1}>
              {displaySubtitle}
            </Text>
          </View>
        </View>

        {/* Header Right Actions */}
        <View style={styles.headerRightRow}>
          {headerRight}
          <GlobalControls showProfile={showProfile} />
        </View>
      </View>

      {/* 2. Responsive Body: 3-column on Tablet/Desktop, 1-column on Mobile */}
      <View style={styles.bodyLayout}>
        {/* Desktop Left Sidebar */}
        {isWidescreen && sidebarOpen && (
          <LeftNavSidebar onClose={() => setSidebarOpen(false)} />
        )}

        {/* Center Main Content Feed */}
        <View style={styles.mainContentColumn}>
          {children}
        </View>

        {/* Optional Page-Specific Desktop Right Column (Rendered ONLY when passed, e.g. on Home Page) */}
        {isWidescreen && rightContent ? (
          <View style={[styles.rightDashboardColumn, { borderLeftColor: borderColor }]}>
            {rightContent}
          </View>
        ) : null}
      </View>

      {/* 3. Floating Action (e.g. Journal FAB) */}
      {floatingAction}

      {/* 4. Mobile Drawer Modal (Identical across all pages) */}
      {!isWidescreen && (
        <Modal
          visible={sidebarOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSidebarOpen(false)}
        >
          <View style={styles.drawerOverlay}>
            <Pressable
              style={styles.drawerBackdrop}
              onPress={() => setSidebarOpen(false)}
            />
            <View
              style={[
                styles.drawerContent,
                {
                  backgroundColor: surfaceColor,
                  paddingTop: insets.top,
                  borderRightColor: borderColor,
                  borderRightWidth: isDark ? 0 : 1,
                },
              ]}
            >
              <LeftNavSidebar onClose={() => setSidebarOpen(false)} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 10,
  },
  titleTextCol: {
    flex: 1,
  },
  orthodoxCrossBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  crossEmoji: {
    fontSize: 20,
  },
  appMainTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  appSubTitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  bodyLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContentColumn: {
    flex: 1,
  },
  rightDashboardColumn: {
    width: 320,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 25, 0.7)',
  },
  drawerContent: {
    width: 270,
    height: '100%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
});
