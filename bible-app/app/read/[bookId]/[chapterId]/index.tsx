import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, Text, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useBible } from '@/context/BibleContext';
import { getChapter } from '@/lib/bibleLoader';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import VerseItem from '@/components/VerseItem';
import { useThemeColor } from '@/hooks/use-theme-color';
import GlobalControls from '@/components/GlobalHeader';

// New features
import ReadingSettingsModal from '@/components/ReadingSettingsModal';
import VerseActionSheet from '@/components/VerseActionSheet';
import { getHighlights, saveHighlights, Highlight } from '@/lib/storage';

export default function ChapterScreen() {
  const insets = useSafeAreaInsets();
  const { bookId = '1', chapterId = '1' } = useLocalSearchParams<{ bookId: string; chapterId: string }>();
  const [verses, setVerses] = useState<any[]>([]);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(21);
  const [lineSpacing, setLineSpacing] = useState(1.8);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');

  // Action Sheet State
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedVerseRef, setSelectedVerseRef] = useState<string | null>(null);
  const [selectedVerseText, setSelectedVerseText] = useState<string>('');
  
  // Highlights State
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const { language } = useBible();
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    getChapter(bookId, chapterId).then(setVerses);
    loadHighlights();
  }, [bookId, chapterId]);

  const loadHighlights = async () => {
    const hl = await getHighlights();
    setHighlights(hl);
  };

  const verseRefPrefix = `${bookId}:${chapterId}`;
  const book = BIBLE_BOOKS.find(b => b.id === bookId);
  
  const displayBookName = language === 'am' ? book?.name : (language === 'both' ? `${book?.name} (${book?.nameEn})` : book?.nameEn);
  const displayChapterLabel = language === 'am' ? `ምዕራፍ ${chapterId}` : (language === 'both' ? `ምዕራፍ / Chapter ${chapterId}` : `Chapter ${chapterId}`);

  // Actions
  const handleLongPressVerse = (vRef: string, text: string) => {
    setSelectedVerseRef(vRef);
    setSelectedVerseText(text);
    setActionSheetVisible(true);
  };

  const handleHighlight = async (color: string) => {
    if (!selectedVerseRef) return;
    
    let updatedHighlights = [...highlights];
    const existingIndex = updatedHighlights.findIndex(h => h.verseRef === selectedVerseRef);
    
    if (color === 'transparent') {
      if (existingIndex >= 0) updatedHighlights.splice(existingIndex, 1);
    } else {
      if (existingIndex >= 0) {
        updatedHighlights[existingIndex].color = color;
      } else {
        updatedHighlights.push({ verseRef: selectedVerseRef, color });
      }
    }
    
    setHighlights(updatedHighlights);
    await saveHighlights(updatedHighlights);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(selectedVerseText);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${selectedVerseText}\n- ${book?.nameEn || book?.name} ${chapterId}:${selectedVerseRef?.split(':v')[1]}`,
      });
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  const getHighlightColor = (vRef: string) => {
    return highlights.find(h => h.verseRef === vRef)?.color;
  };

  return (
    <View style={[styles.container, { backgroundColor: readingTheme === 'dark' ? '#000' : (readingTheme === 'sepia' ? '#fdf6e3' : backgroundColor) }]}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.headerBG, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{displayBookName}</Text>
          <Text style={styles.headerSubTitle}>{displayChapterLabel}</Text>
        </View>

        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
            <Ionicons name="options-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <GlobalControls />
        </View>
      </LinearGradient>

      <FlatList
        data={verses}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const vRef = `${verseRefPrefix}:v${item.verse}`;
          const currentHl = getHighlightColor(vRef);
          return (
            <VerseItem 
              {...item} 
              verseRef={vRef} 
              fontSize={fontSize} 
              lineSpacing={lineSpacing}
              theme={readingTheme}
              highlightColor={currentHl}
              onLongPress={() => handleLongPressVerse(vRef, item.textAm)}
            />
          );
        }}
        keyExtractor={(item) => `v${item.verse}`}
        showsVerticalScrollIndicator={false}
      />

      <ReadingSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineSpacing={lineSpacing}
        setLineSpacing={setLineSpacing}
        readingTheme={readingTheme}
        setReadingTheme={setReadingTheme}
      />

      {selectedVerseRef && (
        <VerseActionSheet
          visible={actionSheetVisible}
          onClose={() => setActionSheetVisible(false)}
          verseRef={selectedVerseRef}
          currentHighlightColor={getHighlightColor(selectedVerseRef)}
          onHighlight={handleHighlight}
          onAddNote={() => {
            router.push(`/journal/new?verseRef=${selectedVerseRef}`);
          }}
          onCopy={handleCopy}
          onShare={handleShare}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBG: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 40,
  }
});

