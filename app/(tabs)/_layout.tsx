import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function TabLayout() {
  const { language } = useBible();
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const tabLabels = {
    home: language === 'am' ? 'መነሻ' : 'Home',
    search: language === 'am' ? 'ፍለጋ' : 'Search',
    bookmarks: language === 'am' ? 'ተወዳጆች' : 'Bookmarks',
    plans: language === 'am' ? 'ዕቅዶች' : 'Plans',
    journal: language === 'am' ? 'ማስታወሻ' : 'Journal',
    daily: language === 'am' ? 'ዕለታዊ' : 'Daily',
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#e5a93c',
        tabBarInactiveTintColor: '#64748b',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: surfaceColor,
          borderTopColor: borderColor,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: tabLabels.home,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: tabLabels.search,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: tabLabels.bookmarks,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="bookmark.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: tabLabels.plans,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: tabLabels.journal,
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="pencil.and.outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          href: null, // Accessible directly from Home Quick Actions
        }}
      />
    </Tabs>
  );
}
