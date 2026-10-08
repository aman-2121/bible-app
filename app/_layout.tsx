import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { BibleProvider } from '@/context/BibleContext';
import { setupBackgroundNotifications } from '@/lib/notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, Platform } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};



// Ignore SDK 53+ push notification warning for Expo Go
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide splash screen as soon as the component mounts
    const init = async () => {
      try {
        await setupBackgroundNotifications();
      } catch (e) {
        console.error("Setup error:", e);
      } finally {
        // Always hide the splash screen even if there's an error
        await SplashScreen.hideAsync().catch(() => {});
      }
    };
    
    init();

    // Set custom Ethiopian Orthodox cross as browser tab icon (favicon) on web
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.type = 'image/svg+xml';
        link.href = '/assets/images/orthodox_cross.svg';
      } catch {}
    }
  }, []);

  return (
    <BibleProvider>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="stats" options={{ presentation: 'card' }} />
            <Stack.Screen name="profile" options={{ presentation: 'card' }} />
            <Stack.Screen name="book/[bookId]/index" options={{ presentation: 'card' }} />
            <Stack.Screen name="read/[bookId]/[chapterId]/index" options={{ presentation: 'card' }} />
            <Stack.Screen name="journal/new" options={{ presentation: 'modal' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </BibleProvider>
  );
}
