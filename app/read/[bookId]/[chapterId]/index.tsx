import React, { useState, useEffect, useRef } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Share,
  Platform,
} from 'react-native';
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

// New Features & Modals
import ReadingSettingsModal from '@/components/ReadingSettingsModal';
import VerseActionSheet from '@/components/VerseActionSheet';
import AudioPlayerBar from '@/components/AudioPlayerBar';
import {
  getHighlights,
  saveHighlights,
  Highlight,
  saveContinueReading,
  recordChapterRead,
  recordBookOpened,
  addReadingMinutes,
} from '@/lib/storage';

export default function ChapterScreen() {
  const insets = useSafeAreaInsets();
  const { bookId = '1', chapterId = '1' } = useLocalSearchParams<{ bookId: string; chapterId: string }>();
  const [verses, setVerses] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(21);
  const [lineSpacing, setLineSpacing] = useState(1.8);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(0);
  const [keepAwake, setKeepAwake] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Audio Player State
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [activeSpeakingIdx, setActiveSpeakingIdx] = useState<number | null>(null);

  // Action Sheet State
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedVerseRef, setSelectedVerseRef] = useState<string | null>(null);
  const [selectedVerseText, setSelectedVerseText] = useState<string>('');

  // Highlights State
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const { language, theme } = useBible();
  const isDark = theme === 'dark';
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const currentBook = BIBLE_BOOKS.find(b => b.id === bookId);
  const totalChapters = currentBook?.chapters || 1;
  const currentChapterNum = parseInt(chapterId, 10) || 1;

  // Track session reading time (1 min intervals)
  useEffect(() => {
    const timer = setInterval(() => {
      addReadingMinutes(1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load verses and register progress
  useEffect(() => {
    getChapter(bookId, chapterId).then(loadedVerses => {
      setVerses(loadedVerses);

      // Record continue reading progress
      if (currentBook) {
        saveContinueReading({
          bookId,
          bookName: currentBook.name,
          bookNameEn: currentBook.nameEn,
          chapterId,
          progressPercent: Math.round((currentChapterNum / totalChapters) * 100),
          timestamp: Date.now(),
        });
        recordChapterRead(bookId, chapterId);
        recordBookOpened(bookId);
      }
    });

    loadHighlights();
    setActiveSpeakingIdx(null);
  }, [bookId, chapterId]);

  const loadHighlights = async () => {
    const hl = await getHighlights();
    setHighlights(hl);
  };

  const verseRefPrefix = `${bookId}:${chapterId}`;
  const displayBookName =
    language === 'am'
      ? currentBook?.name
      : language === 'both'
      ? `${currentBook?.name} (${currentBook?.nameEn})`
      : currentBook?.nameEn;

  const displayChapterLabel =
    language === 'am'
      ? `ምዕራፍ ${chapterId}`
      : language === 'both'
      ? `ምዕራፍ / Chapter ${chapterId}`
      : `Chapter ${chapterId}`;

  // Next / Previous Navigation
  const navigateToChapter = (targetChapter: number) => {
    if (targetChapter >= 1 && targetChapter <= totalChapters) {
      router.replace(`/read/${bookId}/${targetChapter}`);
    } else if (targetChapter > totalChapters) {
      // Next book
      const nextBookId = (parseInt(bookId, 10) + 1).toString();
      const nextBook = BIBLE_BOOKS.find(b => b.id === nextBookId);
      if (nextBook) {
        router.replace(`/read/${nextBookId}/1`);
      }
    } else if (targetChapter < 1) {
      // Previous book
      const prevBookId = (parseInt(bookId, 10) - 1).toString();
      const prevBook = BIBLE_BOOKS.find(b => b.id === prevBookId);
      if (prevBook) {
        router.replace(`/read/${prevBookId}/${prevBook.chapters}`);
      }
    }
  };

  // Actions
  const handleOpenActionSheet = (vRef: string, text: string) => {
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
        message: `${selectedVerseText}\n\n- ${currentBook?.name} ${chapterId}:${selectedVerseRef?.split(':v')[1]}\nShared via Mezamurit 81-Book Bible`,
      });
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  const getHighlightColor = (vRef: string) => {
    return highlights.find(h => h.verseRef === vRef)?.color;
  };

  const getContainerBg = () => {
    if (readingTheme === 'dark') return '#040814';
    if (readingTheme === 'sepia') return '#fbf7ee';
    return backgroundColor;
  };

  const getHeaderBg = () => {
    if (readingTheme === 'dark') return '#091124';
    if (readingTheme === 'sepia') return '#f4ecd8';
    return surfaceColor;
  };

  const getHeaderTextColor = () => {
    if (readingTheme === 'dark') return '#ffffff';
    if (readingTheme === 'sepia') return '#4a3828';
    return textColor;
  };

  const getHeaderBorderColor = () => {
    if (readingTheme === 'dark') return 'rgba(255,255,255,0.08)';
    if (readingTheme === 'sepia') return 'rgba(90,60,30,0.1)';
    return borderColor;
  };

  const getHeaderBtnBg = () => {
    if (readingTheme === 'dark') return 'rgba(255,255,255,0.08)';
    if (readingTheme === 'sepia') return 'rgba(90,60,30,0.08)';
    return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)';
  };

  return (
    <View style={[styles.container, { backgroundColor: getContainerBg() }]}>
      {/* Top Header */}
      {!isFullScreen && (
        <View
          style={[
            styles.headerBG,
            {
              backgroundColor: getHeaderBg(),
              borderBottomColor: getHeaderBorderColor(),
              paddingTop: insets.top + 8,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: getHeaderBtnBg(), borderColor: getHeaderBorderColor() }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={getHeaderTextColor()} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerTitle, { color: getHeaderTextColor() }]}>{displayBookName}</Text>
            <Text style={styles.headerSubTitle}>{displayChapterLabel}</Text>
          </View>

          <View style={styles.headerControls}>
            {/* Audio Toggle */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: getHeaderBtnBg(), borderColor: getHeaderBorderColor() },
                isAudioActive && { backgroundColor: '#e5a93c' },
              ]}
              onPress={() => setIsAudioActive(!isAudioActive)}
            >
              <Ionicons
                name={isAudioActive ? 'volume-high' : 'volume-medium-outline'}
                size={20}
                color={isAudioActive ? '#091124' : getHeaderTextColor()}
              />
            </TouchableOpacity>

            {/* Reading Settings */}
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: getHeaderBtnBg(), borderColor: getHeaderBorderColor() }]}
              onPress={() => setShowSettings(true)}
            >
              <Ionicons name="text" size={18} color={getHeaderTextColor()} />
            </TouchableOpacity>

            <GlobalControls />
          </View>
        </View>
      )}

      {/* Chapter Quick Navigation Strip */}
      <View style={[styles.navStrip, { borderBottomColor: 'rgba(128,128,128,0.1)' }]}>
        <TouchableOpacity
          style={[styles.stripBtn, currentChapterNum <= 1 && { opacity: 0.3 }]}
          onPress={() => navigateToChapter(currentChapterNum - 1)}
          disabled={currentChapterNum <= 1 && parseInt(bookId, 10) <= 1}
        >
          <Ionicons name="chevron-back" size={18} color={tintColor} />
          <Text style={[styles.stripBtnText, { color: tintColor }]}>
            {language === 'am' ? 'ቀደምት ምዕራፍ' : 'Prev Chapter'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsFullScreen(!isFullScreen)}>
          <Ionicons
            name={isFullScreen ? 'contract-outline' : 'expand-outline'}
            size={18}
            color={textColor + '77'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.stripBtn}
          onPress={() => navigateToChapter(currentChapterNum + 1)}
        >
          <Text style={[styles.stripBtnText, { color: tintColor }]}>
            {language === 'am' ? 'ቀጣይ ምዕራፍ' : 'Next Chapter'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={tintColor} />
        </TouchableOpacity>
      </View>

      {/* Main Verse FlatList */}
      <FlatList
        ref={flatListRef}
        data={verses}
        contentContainerStyle={[styles.listContent, isAudioActive && { paddingBottom: 150 }]}
        renderItem={({ item, index }) => {
          const vRef = `${verseRefPrefix}:v${item.verse}`;
          const currentHl = getHighlightColor(vRef);
          const isSpeaking = activeSpeakingIdx === index;

          return (
            <VerseItem
              {...item}
              verseRef={vRef}
              fontSize={fontSize}
              lineSpacing={lineSpacing}
              theme={readingTheme}
              highlightColor={currentHl}
              isSpeaking={isSpeaking}
              onOpenActionSheet={() => handleOpenActionSheet(vRef, item.textAm)}
              onLongPress={() => handleOpenActionSheet(vRef, item.textAm)}
            />
          );
        }}
        keyExtractor={item => `v${item.verse}`}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.footerNav}>
            <TouchableOpacity
              style={[styles.footerNavBtn, { backgroundColor: tintColor + '12' }]}
              onPress={() => navigateToChapter(currentChapterNum - 1)}
              disabled={currentChapterNum <= 1 && parseInt(bookId, 10) <= 1}
            >
              <Ionicons name="arrow-back" size={16} color={tintColor} />
              <Text style={[styles.footerNavText, { color: tintColor }]}>
                {language === 'am' ? 'ቀደምት ምዕራፍ' : 'Previous'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerNavBtn, { backgroundColor: '#c69214' }]}
              onPress={() => navigateToChapter(currentChapterNum + 1)}
            >
              <Text style={[styles.footerNavText, { color: '#fff' }]}>
                {language === 'am' ? 'ቀጣይ ምዕራፍ' : 'Next'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Sticky Audio Player */}
      {isAudioActive && (
        <AudioPlayerBar
          verses={verses}
          currentBookName={currentBook?.name || ''}
          chapterId={chapterId}
          initialVerseIndex={activeSpeakingIdx !== null ? activeSpeakingIdx : 0}
          autoPlay={true}
          onActiveVerseChange={idx => {
            setActiveSpeakingIdx(idx);
            // Smoothly auto-scroll to the spoken verse
            if (flatListRef.current && idx < verses.length) {
              flatListRef.current.scrollToIndex({
                index: idx,
                animated: true,
                viewPosition: 0.3,
              });
            }
          }}
          onNextChapter={() => navigateToChapter(currentChapterNum + 1)}
          onClose={() => {
            setIsAudioActive(false);
            setActiveSpeakingIdx(null);
          }}
        />
      )}

      {/* Reading Settings Modal */}
      <ReadingSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineSpacing={lineSpacing}
        setLineSpacing={setLineSpacing}
        readingTheme={readingTheme}
        setReadingTheme={setReadingTheme}
        autoScrollSpeed={autoScrollSpeed}
        setAutoScrollSpeed={setAutoScrollSpeed}
        keepAwake={keepAwake}
        setKeepAwake={setKeepAwake}
      />

      {/* Verse Action Sheet */}
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
          onReadAloud={() => {
            const verseNum = parseInt(selectedVerseRef.split(':v')[1], 10);
            const idx = verses.findIndex(v => v.verse === verseNum);
            setActiveSpeakingIdx(idx >= 0 ? idx : 0);
            setIsAudioActive(true);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBG: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e5a93c',
    letterSpacing: 0.3,
    marginTop: 1,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  stripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stripBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    gap: 16,
  },
  footerNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  footerNavText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
