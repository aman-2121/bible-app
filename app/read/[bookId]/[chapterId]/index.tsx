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
import * as Clipboard from 'expo-clipboard';
import { useBible } from '@/context/BibleContext';
import { getChapter } from '@/lib/bibleLoader';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import VerseItem from '@/components/VerseItem';
import { useThemeColor } from '@/hooks/use-theme-color';
import { stopSpeech } from '@/lib/tts';

// Modals & Panels
import ReadingSettingsModal from '@/components/ReadingSettingsModal';
import VerseActionSheet from '@/components/VerseActionSheet';
import AudioPlayerBar from '@/components/AudioPlayerBar';
import DeveloperProfileModal from '@/components/DeveloperProfileModal';
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
  const [showDeveloperProfile, setShowDeveloperProfile] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [lineSpacing, setLineSpacing] = useState(1.68);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('dark');
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

  const { language, toggleLanguage, theme, toggleTheme } = useBible();
  const isDark = theme === 'dark' || readingTheme === 'dark';
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

  // Stop audio on unmount or navigation away
  useEffect(() => {
    return () => {
      stopSpeech();
    };
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
      ? `ምዕ. ${chapterId}`
      : language === 'both'
      ? `ምዕ. / Ch. ${chapterId}`
      : `Ch. ${chapterId}`;

  // Next / Previous Navigation
  const navigateToChapter = (targetChapter: number) => {
    stopSpeech();
    setIsAudioActive(false);
    setActiveSpeakingIdx(null);

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
        message: `${selectedVerseText}\n\n- ${currentBook?.name} ${chapterId}:${selectedVerseRef?.split(':v')[1]}\n81 መጽሐፍ ቅዱስ • Ethiopian Orthodox Bible`,
      });
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  const getHighlightColor = (vRef: string) => {
    return highlights.find(h => h.verseRef === vRef)?.color;
  };

  const getContainerBg = () => {
    if (readingTheme === 'dark') return '#070e1e';
    if (readingTheme === 'sepia') return '#fbf7ee';
    return backgroundColor;
  };

  const getHeaderBg = () => {
    if (readingTheme === 'dark') return '#0d172e';
    if (readingTheme === 'sepia') return '#f4ecd8';
    return surfaceColor;
  };

  const getHeaderTextColor = () => {
    if (readingTheme === 'dark') return '#f8fafc';
    if (readingTheme === 'sepia') return '#4a3828';
    return textColor;
  };

  const getHeaderBorderColor = () => {
    if (readingTheme === 'dark') return 'rgba(212, 175, 55, 0.2)';
    if (readingTheme === 'sepia') return 'rgba(90, 60, 30, 0.12)';
    return borderColor;
  };

  const getHeaderBtnBg = () => {
    if (readingTheme === 'dark') return 'rgba(255, 255, 255, 0.06)';
    if (readingTheme === 'sepia') return 'rgba(90, 60, 30, 0.06)';
    return isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)';
  };

  const getLangBadgeText = () => {
    if (language === 'am') return 'አማ';
    if (language === 'en') return 'EN';
    return 'ሁሉ';
  };

  return (
    <View style={[styles.container, { backgroundColor: getContainerBg() }]}>
      {/* 1. Compact Top Control Bar (Excessive empty space removed) */}
      {!isFullScreen && (
        <View
          style={[
            styles.headerBar,
            {
              backgroundColor: getHeaderBg(),
              borderBottomColor: getHeaderBorderColor(),
              paddingTop: Math.max(insets.top, 8) + 4,
            },
          ]}
        >
          {/* Back Button (Standard Android navigation arrow) */}
          <TouchableOpacity
            style={[
              styles.navBtn,
              { backgroundColor: getHeaderBtnBg(), borderColor: getHeaderBorderColor() },
            ]}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Go back to previous screen"
          >
            <Ionicons name="arrow-back" size={19} color={getHeaderTextColor()} />
          </TouchableOpacity>

          {/* Compact Book & Chapter Title */}
          <View style={styles.titleContainer}>
            <Text
              style={[styles.bookTitleText, { color: getHeaderTextColor() }]}
              numberOfLines={1}
            >
              {displayBookName}
            </Text>
            <Text style={styles.chapterSubtitleText}>
              {displayChapterLabel}
            </Text>
          </View>

          {/* Right Action Controls: Uniformly sized (32x32), evenly spaced */}
          <View style={styles.rightControlsGroup}>
            {/* Audio Toggle */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: getHeaderBtnBg(), borderColor: getHeaderBorderColor() },
                isAudioActive && { backgroundColor: '#e5a93c', borderColor: '#c69214' },
              ]}
              onPress={() => setIsAudioActive(!isAudioActive)}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              accessibilityLabel="Audio narration"
            >
              <Ionicons
                name={isAudioActive ? 'volume-high' : 'volume-medium-outline'}
                size={17}
                color={isAudioActive ? '#091124' : getHeaderTextColor()}
              />
            </TouchableOpacity>

            {/* Font Size Button */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: getHeaderBtnBg(), borderColor: getHeaderBorderColor() },
              ]}
              onPress={() => setShowSettings(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              accessibilityLabel="Reading settings"
            >
              <Ionicons name="text" size={16} color={getHeaderTextColor()} />
            </TouchableOpacity>

            {/* Language Selector Button */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                styles.langBtn,
                { backgroundColor: getHeaderBtnBg(), borderColor: getHeaderBorderColor() },
              ]}
              onPress={toggleLanguage}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              accessibilityLabel="Switch language"
            >
              <Text style={[styles.langBtnText, { color: '#e5a93c' }]}>
                {getLangBadgeText()}
              </Text>
            </TouchableOpacity>

            {/* Dark / Light Mode Toggle */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: getHeaderBtnBg(), borderColor: getHeaderBorderColor() },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              accessibilityLabel="Toggle dark/light mode"
            >
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={16}
                color="#e5a93c"
              />
            </TouchableOpacity>

            {/* Developer Profile Button */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                styles.profileBtn,
                { backgroundColor: getHeaderBtnBg(), borderColor: getHeaderBorderColor() },
              ]}
              onPress={() => setShowDeveloperProfile(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              accessibilityLabel="Developer Profile"
            >
              <Ionicons name="person" size={15} color="#e5a93c" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 2. Compact Chapter Navigation Strip */}
      <View
        style={[
          styles.navStrip,
          {
            backgroundColor: getHeaderBg(),
            borderBottomColor: getHeaderBorderColor(),
          },
        ]}
      >
        {/* Previous Chapter */}
        <TouchableOpacity
          style={[
            styles.stripBtn,
            currentChapterNum <= 1 && parseInt(bookId, 10) <= 1 && { opacity: 0.35 },
          ]}
          onPress={() => navigateToChapter(currentChapterNum - 1)}
          disabled={currentChapterNum <= 1 && parseInt(bookId, 10) <= 1}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={16} color={tintColor} />
          <Text style={[styles.stripBtnText, { color: tintColor }]}>
            {language === 'am' ? 'ቀደምት' : 'Prev'}
          </Text>
        </TouchableOpacity>

        {/* Current Book & Chapter Center Indicator */}
        <View
          style={[
            styles.chapterIndicatorPill,
            {
              backgroundColor: isDark ? 'rgba(212, 175, 55, 0.12)' : 'rgba(212, 175, 55, 0.1)',
              borderColor: isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.25)',
            },
          ]}
        >
          <Text style={styles.chapterIndicatorText}>
            {language === 'am'
              ? `ምዕራፍ ${chapterId} ከ ${totalChapters}`
              : `Chapter ${chapterId} of ${totalChapters}`}
          </Text>
        </View>

        {/* Next Chapter */}
        <TouchableOpacity
          style={styles.stripBtn}
          onPress={() => navigateToChapter(currentChapterNum + 1)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 8, right: 8 }}
        >
          <Text style={[styles.stripBtnText, { color: tintColor }]}>
            {language === 'am' ? 'ቀጣይ' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={tintColor} />
        </TouchableOpacity>
      </View>

      {/* 3. Main Verse Area — Maximized Screen Real Estate */}
      <FlatList
        ref={flatListRef}
        data={verses}
        contentContainerStyle={[
          styles.listContent,
          isAudioActive && { paddingBottom: 160 },
        ]}
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
              style={[
                styles.footerNavBtn,
                { backgroundColor: tintColor + '12', borderColor: tintColor + '33', borderWidth: 1 },
                currentChapterNum <= 1 && parseInt(bookId, 10) <= 1 && { opacity: 0.4 },
              ]}
              onPress={() => navigateToChapter(currentChapterNum - 1)}
              disabled={currentChapterNum <= 1 && parseInt(bookId, 10) <= 1}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={16} color={tintColor} />
              <Text style={[styles.footerNavText, { color: tintColor }]}>
                {language === 'am' ? 'ቀደምት ምዕራፍ' : 'Previous Chapter'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.footerNavBtn, { backgroundColor: '#c69214' }]}
              onPress={() => navigateToChapter(currentChapterNum + 1)}
              activeOpacity={0.7}
            >
              <Text style={[styles.footerNavText, { color: '#fff' }]}>
                {language === 'am' ? 'ቀጣይ ምዕራፍ' : 'Next Chapter'}
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        }
      />

      {/* 4. Sticky Audio Player Bar */}
      {isAudioActive && (
        <AudioPlayerBar
          verses={verses}
          currentBookName={currentBook?.name || ''}
          chapterId={chapterId}
          initialVerseIndex={activeSpeakingIdx !== null ? activeSpeakingIdx : 0}
          autoPlay={true}
          onActiveVerseChange={idx => {
            setActiveSpeakingIdx(idx);
            if (flatListRef.current && idx < verses.length) {
              flatListRef.current.scrollToIndex({
                index: idx,
                animated: true,
                viewPosition: 0.25,
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

      {/* 5. Reading Settings Modal */}
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

      {/* 6. Verse Action Sheet */}
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

      {/* 7. Developer Profile Modal */}
      <DeveloperProfileModal
        visible={showDeveloperProfile}
        onClose={() => setShowDeveloperProfile(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookTitleText: {
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  chapterSubtitleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e5a93c',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  rightControlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langBtn: {
    paddingHorizontal: 2,
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  profileBtn: {},
  navStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderBottomWidth: 1,
  },
  stripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  stripBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chapterIndicatorPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e5a93c',
    letterSpacing: 0.2,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 60,
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 40,
    gap: 12,
  },
  footerNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  footerNavText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
