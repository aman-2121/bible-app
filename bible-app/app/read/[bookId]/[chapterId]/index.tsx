import React, { useState, useEffect } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBible } from '@/context/BibleContext';
import { getChapter } from '@/lib/bibleLoader';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import VerseItem from '@/components/VerseItem';
import { useThemeColor } from '@/hooks/use-theme-color';
import GlobalControls from '@/components/GlobalHeader';

export default function ChapterScreen() {
  const insets = useSafeAreaInsets();
  const { bookId = '1', chapterId = '1' } = useLocalSearchParams<{ bookId: string; chapterId: string }>();
  const [verses, setVerses] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(21);
  const [lineSpacing, setLineSpacing] = useState(1.8);
  const [readingTheme, setReadingTheme] = useState<'light' | 'sepia' | 'dark'>('light');

  const { language } = useBible();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    getChapter(bookId, chapterId).then(setVerses);
  }, [bookId, chapterId]);

  const verseRef = `${bookId}:${chapterId}`;
  const book = BIBLE_BOOKS.find(b => b.id === bookId);
  
  const getModalBg = () => {
    if (readingTheme === 'sepia') return '#f4ecd8';
    if (readingTheme === 'dark') return '#1a1a1a';
    return '#fff';
  };

  const getModalText = () => {
    if (readingTheme === 'dark') return '#fff';
    if (readingTheme === 'sepia') return '#5b4636';
    return '#000';
  };

  const displayBookName = language === 'am' ? book?.name : (language === 'both' ? `${book?.name} (${book?.nameEn})` : book?.nameEn);
  const displayChapterLabel = language === 'am' ? `ምዕራፍ ${chapterId}` : (language === 'both' ? `ምዕራፍ / Chapter ${chapterId}` : `Chapter ${chapterId}`);

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
        renderItem={({ item }) => (
          <VerseItem 
            {...item} 
            verseRef={`${verseRef}:v${item.verse}`} 
            fontSize={fontSize} 
            lineSpacing={lineSpacing}
            theme={readingTheme}
          />
        )}
        keyExtractor={(item) => `v${item.verse}`}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showSettings}
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowSettings(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: getModalBg() }]}>
            <Text style={[styles.modalTitle, { color: getModalText() }]}>Reading Settings</Text>
            
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: getModalText() }]}>Font Size</Text>
              <View style={styles.sizeControls}>
                <TouchableOpacity onPress={() => setFontSize(Math.max(14, fontSize - 2))} style={styles.sizeBtn}>
                  <Text style={[styles.btnSymbol, { color: getModalText() }]}>A-</Text>
                </TouchableOpacity>
                <Text style={[styles.fontSizeNum, { color: getModalText() }]}>{fontSize}</Text>
                <TouchableOpacity onPress={() => setFontSize(Math.min(32, fontSize + 2))} style={styles.sizeBtn}>
                  <Text style={[styles.btnSymbol, { color: getModalText() }]}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: getModalText() }]}>Line Spacing</Text>
              <View style={styles.chipGroup}>
                {[1.4, 1.8, 2.2].map((s) => (
                  <TouchableOpacity 
                    key={s} 
                    onPress={() => setLineSpacing(s)}
                    style={[styles.chip, lineSpacing === s && { backgroundColor: tintColor }]}
                  >
                    <Text style={[styles.chipText, lineSpacing === s && { color: '#fff' }]}>
                      {s === 1.4 ? 'Narrow' : s === 1.8 ? 'Normal' : 'Wide'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: getModalText() }]}>Theme</Text>
              <View style={styles.themeGroup}>
                {(['light', 'sepia', 'dark'] as const).map((t) => (
                  <TouchableOpacity 
                    key={t} 
                    onPress={() => setReadingTheme(t)}
                    style={[
                      styles.themeCircle, 
                      { backgroundColor: t === 'light' ? '#fff' : t === 'sepia' ? '#f4ecd8' : '#333' },
                      readingTheme === t && { borderWidth: 3, borderColor: tintColor }
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.closeBtn, { backgroundColor: tintColor }]} 
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    fontFamily: 'NotoSansEthiopic-Regular',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    minHeight: 250,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 25,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  sizeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(128,128,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fontSizeNum: {
    fontSize: 18,
    fontWeight: '700',
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeGroup: {
    flexDirection: 'row',
    gap: 15,
  },
  themeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  closeBtn: {
    height: 55,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

