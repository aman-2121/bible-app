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

  const labels = {
    title: language === 'am' ? 'ተወዳጆች' : (language === 'both' ? 'ተወዳጆች / Bookmarks' : 'Bookmarks'),
    emptyTitle: language === 'am' ? 'ምንም ተወዳጆች የሉም' : (language === 'both' ? 'ምንም የሉም / No Bookmarks' : 'No Bookmarks Yet'),
    emptySub: language === 'am' ? 'የሚያስቀምጡ ጥቅሶች እዚህ ይታያሉ' : (language === 'both' ? 'የሚያስቀምጡ ይታያሉ / Saved verses appear here' : 'Verses you save will appear here')
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{labels.title}</Text>
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
              <View style={[styles.emptyIconBg, { backgroundColor: tintColor + '11' }]}>
                <Ionicons name="bookmark-outline" size={64} color={tintColor + '33'} />
              </View>
              <Text style={[styles.emptyText, { color: textColor }]}>{labels.emptyTitle}</Text>
              <Text style={[styles.emptySubText, { color: textColor + '66' }]}>{labels.emptySub}</Text>
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
    paddingBottom: 35,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
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
    fontFamily: 'NotoSansEthiopic-Regular',
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
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: 'NotoSansEthiopic-Regular',
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'NotoSansEthiopic-Regular',
  },
});

