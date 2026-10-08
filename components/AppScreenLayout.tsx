import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import GlobalControls from '@/components/GlobalHeader';
import LeftNavSidebar from '@/components/LeftNavSidebar';
import OrthodoxCross from '@/components/OrthodoxCross';

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
 * - Shared Top Header Bar with ☰ Hamburger Menu toggle, Orthodox Cross, App Titles, and GlobalControls.
 * - True Toggle Hamburger Menu:
 *    • Closed → click ☰ → Sidebar opens
 *    • Open → click ☰ → Sidebar closes
 *    • Remains ☰ (never replaced with a cross)
 *    • Accessible and clickable at all times (both desktop and mobile)
 * - Synchronized Sidebar State via BibleContext across mobile and desktop.
 * - Smooth, professional open/close transitions:
 *    • Desktop: Smooth horizontal container width/opacity transition (0px ↔ 250px)
 *    • Mobile: Smooth off-canvas slide & backdrop fade (-270px ↔ 0px)
 * - Preserved existing Dark/Night Mode and sidebar design.
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

  const { sidebarOpen, toggleSidebar, closeSidebar, theme, language } = useBible();
  const isDark = theme === 'dark';

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  // Animation drivers
  const desktopAnim = useRef(new Animated.Value(isWidescreen && sidebarOpen ? 1 : 0)).current;
  const mobileAnim = useRef(new Animated.Value(!isWidescreen && sidebarOpen ? 1 : 0)).current;

  // Track if mobile drawer is mounted
  const [mobileDrawerMounted, setMobileDrawerMounted] = useState(!isWidescreen && sidebarOpen);

  useEffect(() => {
    if (isWidescreen) {
      Animated.timing(desktopAnim, {
        toValue: sidebarOpen ? 1 : 0,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }).start();
    } else {
      if (sidebarOpen) {
        setMobileDrawerMounted(true);
        Animated.timing(mobileAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: false,
        }).start();
      } else {
        Animated.timing(mobileAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (finished) {
            setMobileDrawerMounted(false);
          }
        });
      }
    }
  }, [sidebarOpen, isWidescreen]);

  const desktopWidth = desktopAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 250],
  });

  const desktopOpacity = desktopAnim.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 0.4, 1],
  });

  const mobileTranslateX = mobileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-270, 0],
  });

  const backdropOpacity = mobileAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const defaultTitle = '81 መጽሐፍ ቅዱስ';
  const defaultSubtitle = language === 'am' ? 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ' : 'Ethiopian Orthodox Bible';

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  return (
    <View style={[styles.rootContainer, { backgroundColor, paddingTop: insets.top }]}>
      {/* 1. Global App Header — Always accessible with zIndex on top */}
      <View style={[styles.topHeaderBar, { borderBottomColor: borderColor }]}>
        <View style={styles.brandRow}>
          {/* Back Button (←) if navigating from a nested screen */}
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
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={20} color={isDark ? '#e5a93c' : '#091124'} />
            </TouchableOpacity>
          )}

          {/* Hamburger Menu Toggle (☰) — True toggle, never replaced by a cross */}
          <TouchableOpacity
            style={[
              styles.hamburgerBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.1)',
              },
            ]}
            onPress={toggleSidebar}
            activeOpacity={0.7}
            accessibilityLabel="Toggle Navigation Sidebar"
            accessibilityRole="button"
          >
            <Ionicons
              name="menu"
              size={22}
              color="#e5a93c"
            />
          </TouchableOpacity>

          {/* Traditional Ethiopian Orthodox Cross Badge */}
          <View style={styles.orthodoxCrossBadge}>
            <OrthodoxCross size={24} variant="lalibela" glow={true} />
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

      {/* 2. Responsive Body Layout */}
      <View style={styles.bodyLayout}>
        {/* Desktop Left Sidebar (Rendered on Widescreen only, smooth slide/collapse) */}
        {isWidescreen && (
          <Animated.View
            style={[
              styles.desktopSidebarWrapper,
              {
                width: desktopWidth,
                opacity: desktopOpacity,
              },
            ]}
          >
            <View style={styles.sidebarInner}>
              <LeftNavSidebar onClose={closeSidebar} />
            </View>
          </Animated.View>
        )}

        {/* Center Main Content Feed */}
        <View style={styles.mainContentColumn}>
          {children}
        </View>

        {/* Optional Desktop Right Column (Rendered ONLY when passed, e.g. on Home Page) */}
        {isWidescreen && rightContent ? (
          <View style={[styles.rightDashboardColumn, { borderLeftColor: borderColor }]}>
            {rightContent}
          </View>
        ) : null}
      </View>

      {/* 3. Floating Action (e.g. Journal FAB) */}
      {floatingAction}

      {/* 4. Mobile Drawer Overlay (Smooth off-canvas slide, header remains accessible at all times) */}
      {!isWidescreen && mobileDrawerMounted && (
        <View
          style={[
            styles.drawerOverlay,
            { top: insets.top + 57 },
          ]}
        >
          {/* Animated Dim Backdrop */}
          <Animated.View
            style={[
              styles.drawerBackdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          >
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={closeSidebar}
              accessibilityLabel="Close sidebar backdrop"
            />
          </Animated.View>

          {/* Animated Sliding Drawer */}
          <Animated.View
            style={[
              styles.drawerContent,
              {
                backgroundColor: surfaceColor,
                transform: [{ translateX: mobileTranslateX }],
                borderRightColor: borderColor,
                borderRightWidth: isDark ? 0 : 1,
              },
            ]}
          >
            <LeftNavSidebar onClose={closeSidebar} />
          </Animated.View>
        </View>
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
    zIndex: 100,
    elevation: 10,
    position: 'relative',
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
  desktopSidebarWrapper: {
    overflow: 'hidden',
    height: '100%',
  },
  sidebarInner: {
    width: 250,
    height: '100%',
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 90,
    elevation: 9,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 25, 0.72)',
  },
  drawerContent: {
    width: 270,
    height: '100%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
  },
});
