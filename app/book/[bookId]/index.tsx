import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBible } from '@/context/BibleContext';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getReadingStats } from '@/lib/storage';
import AppScreenLayout from '@/components/AppScreenLayout';

export default function BookScreen() {
  const insets = useSafeAreaInsets();
  const { bookId = '1' } = useLocalSearchParams<{ bookId: string }>();
  const [chapters, setChapters] = useState<number[]>([]);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const { language, theme } = useBible();
  const isDark = theme === 'dark';
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const [book, setBook] = useState<any>(null);

  useEffect(() => {
    const b = BIBLE_BOOKS.find(b => b.id === bookId);
    setBook(b);
    if (b) {
      const chapterCount = b.chapters;
      setChapters(Array.from({ length: chapterCount }, (_, i) => i + 1));
    }
  }, [bookId]);

  useFocusEffect(
    React.useCallback(() => {
      getReadingStats().then(s => setCompletedChapters(s.chaptersRead));
    }, [bookId])
  );

  const onChapterPress = (chapterId: number) => {
    router.push(`/read/${bookId}/${chapterId}`);
  };

  const displayName =
    language === 'am'
      ? book?.name
      : language === 'both'
      ? `${book?.name} (${book?.nameEn})`
      : book?.nameEn;

  const introText =
    language === 'am'
      ? 'የሚፈልጉትን ምዕራፍ ይምረጡ'
      : language === 'both'
      ? 'ምዕራፍ ይምረጡ / Select a Chapter'
      : 'Select a chapter to read';

  const completedForThisBook = chapters.filter(c => completedChapters.includes(`${bookId}:${c}`)).length;

  return (
    <AppScreenLayout
      title={displayName || 'መጽሐፍ'}
      subtitle={`${book?.chapters || 0} ${language === 'am' ? 'ምዕራፎች' : 'Chapters'}`}
      showBackBtn={true}
    >
      <FlatList
        data={chapters}
        keyExtractor={item => item.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Hero Card */}
            <LinearGradient
              colors={isDark ? ['#0e172a', '#14203d'] : ['#ffffff', '#f8fafc']}
              style={[styles.heroBanner, { borderColor }]}
            >
              <View style={styles.heroTopRow}>
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>
                    {book?.testament === 'old'
                      ? (language === 'am' ? 'ብሉይ ኪዳን' : 'Old Testament')
                      : (language === 'am' ? 'ሐዲስ ኪዳን' : 'New Testament')}
                  </Text>
                </View>
                <View style={[styles.progressPill, { backgroundColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.12)' }]}>
                  <Text style={styles.progressText}>
                    {completedForThisBook} / {book?.chapters || 0} {language === 'am' ? 'የተነበቡ' : 'Read'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.heroBookTitle, { color: textColor }]}>{displayName}</Text>
              <Text style={[styles.introText, { color: textColor + '88' }]}>{introText}</Text>
            </LinearGradient>
          </View>
        }
        renderItem={({ item }) => {
          const isDone = completedChapters.includes(`${bookId}:${item}`);

          return (
            <TouchableOpacity
              style={[
                styles.chapterRow,
                { backgroundColor: surfaceColor, borderColor: isDone ? 'rgba(16, 185, 129, 0.4)' : borderColor },
              ]}
              onPress={() => onChapterPress(item)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.rowIcon,
                  { backgroundColor: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 175, 55, 0.12)' },
                ]}
              >
                <Text
                  style={[
                    styles.chapterNum,
                    { color: isDone ? '#10b981' : '#c69214' },
                  ]}
                >
                  {item}
                </Text>
              </View>

              <View style={styles.rowTextContainer}>
                <Text style={[styles.fullChapterName, { color: textColor }]}>
                  {language === 'am' && `${book?.name} ምዕራፍ ${item}`}
                  {language === 'en' && `${book?.nameEn} Chapter ${item}`}
                  {language === 'both' && (
                    <Text>
                      {book?.name} ምዕራፍ ${item} {'\n'}
                      <Text style={{ fontSize: 13, opacity: 0.65 }}>
                        {book?.nameEn} Chapter {item}
                      </Text>
                    </Text>
                  )}
                </Text>
              </View>

              {isDone ? (
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={textColor + '33'} />
              )}
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    padding: 20,
    borderRadius: 20,
    marginTop: 14,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgePill: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#091124',
    fontSize: 11,
    fontWeight: '800',
  },
  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressText: {
    color: '#e5a93c',
    fontSize: 11,
    fontWeight: '700',
  },
  heroBookTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  introText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    elevation: 1,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  chapterNum: {
    fontSize: 16,
    fontWeight: '800',
  },
  rowTextContainer: {
    flex: 1,
  },
  fullChapterName: {
    fontSize: 15,
    fontWeight: '700',
  },
});
