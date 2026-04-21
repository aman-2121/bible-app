import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBible } from '@/context/BibleContext';
import GlobalControls from '@/components/GlobalHeader';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import { loadBook } from '@/lib/bibleLoader';
import { useThemeColor } from '@/hooks/use-theme-color';

const { width } = Dimensions.get('window');

export default function BookScreen() {
  const insets = useSafeAreaInsets();
  const { bookId = '1' } = useLocalSearchParams<{ bookId: string }>();
  const [chapters, setChapters] = useState<number[]>([]);
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const { language } = useBible();
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

  const onChapterPress = (chapterId: number) => {
    router.push(`/read/${bookId}/${chapterId}`);
  };

  const displayBookName = language === 'am' ? book?.name : (language === 'both' ? `${book?.name} (${book?.nameEn})` : book?.nameEn);
  const introText = language === 'am' ? 'እንኳን ደህና መጡ! ምዕራፍ ይምረጡ' : (language === 'both' ? 'Welcome! ምዕራፍ ይምረጡ' : 'Welcome! Please select a chapter');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.bookName}>{displayBookName}</Text>
        </View>
        <GlobalControls />
      </LinearGradient>

      <View style={styles.introBox}>
        <Text style={[styles.introText, { color: textColor }]}>{introText}</Text>
      </View>

      <FlatList
        data={chapters}
        keyExtractor={item => item.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.chapterRow, { backgroundColor: surfaceColor, borderColor: borderColor }]} 
            onPress={() => onChapterPress(item)}
            activeOpacity={0.7}
          >
            <View style={[styles.rowIcon, { backgroundColor: tintColor + '10' }]}>
              <Text style={[styles.chapterNum, { color: tintColor }]}>{item}</Text>
            </View>
            <View style={styles.rowTextContainer}>
              <Text style={[styles.fullChapterName, { color: textColor }]}>
                {language === 'am' && `${book?.name} ምዕራፍ ${item}`}
                {language === 'en' && `${book?.nameEn} Chapter ${item}`}
                {language === 'both' && (
                  <Text>
                    {book?.name} ምዕራፍ {item} {"\n"}
                    <Text style={{ fontSize: 13, opacity: 0.6 }}>{book?.nameEn} Chapter {item}</Text>
                  </Text>
                )}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={textColor + '33'} />
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 25,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bookName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    fontFamily: 'NotoSansEthiopic-Regular',
  },
  introBox: {
    padding: 25,
    alignItems: 'center',
  },
  introText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'NotoSansEthiopic-Regular',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  rowIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  chapterNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  rowTextContainer: {
    flex: 1,
  },
  fullChapterName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'NotoSansEthiopic-Regular',
  },
});

