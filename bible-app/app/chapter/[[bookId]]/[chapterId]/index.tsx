import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useBible } from '@/context/BibleContext';
import { getChapter } from '@/lib/bibleLoader';
import VerseItem from '@/components/VerseItem';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ChapterScreen() {
  const { bookId = '1', chapterId = '1' } = useLocalSearchParams<{ bookId: string; chapterId: string }>();
  const [verses, setVerses] = useState<any[]>([]);
  const { currentBook, currentChapter } = useBible();
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    getChapter(bookId, chapterId).then(setVerses);
  }, [bookId, chapterId]);

  const verseRef = `${bookId}:${chapterId}`;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedText style={styles.header}>Book {currentBook} Chapter {currentChapter}</ThemedText>
      <FlatList
        data={verses}
        renderItem={({ item }) => <VerseItem {...item} verseRef={`${verseRef}:v${item.verse}`} />}
        keyExtractor={(item) => `v${item.verse}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 18, textAlign: 'center', marginVertical: 10 },
});

