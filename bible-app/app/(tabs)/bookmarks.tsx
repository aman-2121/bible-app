import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBible } from '@/context/BibleContext';
import VerseItem from '@/components/VerseItem';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getVersesByRefs } from '@/lib/bibleLoader';
import GlobalControls from '@/components/GlobalHeader';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const { bookmarks, language } = useBible();
  const [bookmarkedVerses, setBookmarkedVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    setLoading(true);
    getVersesByRefs(bookmarks).then(verses => {
      setBookmarkedVerses(verses);
      setLoading(false);
    });
  }, [bookmarks]);

  const title = language === 'am' ? 'ተወዳጆች' : (language === 'both' ? 'ተወዳጆች (Bookmarks)' : 'Bookmarks');
  const emptyTitle = language === 'am' ? 'ምንም ተወዳጆች የሉም' : (language === 'both' ? 'No Bookmarks / ምንም የሉም' : 'No Bookmarks Yet');
  const emptySub = language === 'am' ? 'የሚያስቀምጡ ጥቅሶች እዚህ ይታያሉ' : (language === 'both' ? 'Saved verses appear here / የሚያስቀምጡ ይታያሉ' : 'Verses you save will appear here');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{title}</Text>
          <GlobalControls />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      ) : (
        <FlatList
          data={bookmarkedVerses}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <VerseItem {...item} verseRef={item.verseRef} />}
          keyExtractor={(item) => item.verseRef}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={80} color="rgba(128,128,128,0.2)" />
              <Text style={[styles.emptyText, { color: textColor }]}>{emptyTitle}</Text>
              <Text style={styles.emptySubText}>{emptySub}</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 40,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 120,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
});
