import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { BibleProvider } from '@/context/BibleContext';
import { setupBackgroundNotifications } from '@/lib/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';

// Ignore SDK 53+ push notification warning for Expo Go
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    setupBackgroundNotifications();
  }, []);

  return (
    <BibleProvider>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </BibleProvider>
  );
}
