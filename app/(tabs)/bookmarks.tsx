import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useWindowDimensions,
  Modal,
  Pressable,
  Share,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { speakBibleText, stopSpeech } from '@/lib/tts';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getVersesByRefs } from '@/lib/bibleLoader';
import AppScreenLayout from '@/components/AppScreenLayout';
import OrthodoxCross from '@/components/OrthodoxCross';
import {
  getCollections,
  createCollection,
  BookmarkCollection,
} from '@/lib/storage';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';

export default function BookmarksScreen() {
  const { width } = useWindowDimensions();
  const isWidescreen = width >= 1024;

  const { bookmarks, language, toggleBookmark, theme } = useBible();
  const isDark = theme === 'dark';
  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [bookmarkedVerses, setBookmarkedVerses] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [speakingRef, setSpeakingRef] = useState<string | null>(null);

  // New Collection Input State
  const [showNewColModal, setShowNewColModal] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const loadData = async () => {
    setLoading(true);
    try {
      const cols = await getCollections();
      setCollections(cols);

      // Determine which refs to fetch
      let targetRefs: string[] = [];
      if (selectedCollectionId === 'all') {
        targetRefs = bookmarks;
      } else {
        const selected = cols.find(c => c.id === selectedCollectionId);
        targetRefs = selected ? selected.verseRefs : [];
      }

      const verses = await getVersesByRefs(targetRefs);
      setBookmarkedVerses(verses);
    } catch (e) {
      console.log('Error loading bookmarks', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [bookmarks, selectedCollectionId])
  );

  const handleCreateCollection = async () => {
    if (!newColTitle.trim()) return;
    const updated = await createCollection(newColTitle.trim(), newColTitle.trim(), 'folder');
    setCollections(updated);
    setNewColTitle('');
    setShowNewColModal(false);
  };

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Automatically switch audio language when user changes language
  useEffect(() => {
    if (speakingRef) {
      const activeVerse = bookmarkedVerses.find(v => v.verseRef === speakingRef);
      if (activeVerse) {
        speakBibleText({
          textAm: activeVerse.textAm,
          textEn: activeVerse.textEn,
          appLang: language,
          onStart: () => setSpeakingRef(activeVerse.verseRef),
          onDone: () => setSpeakingRef(null),
          onError: () => setSpeakingRef(null),
        });
      } else {
        stopSpeech();
        setSpeakingRef(null);
      }
    }
  }, [language]);

  const speakVerse = async (verseItem: any) => {
    if (speakingRef === verseItem.verseRef) {
      await stopSpeech();
      setSpeakingRef(null);
      return;
    }
    await stopSpeech();
    setSpeakingRef(verseItem.verseRef);

    await speakBibleText({
      textAm: verseItem.textAm,
      textEn: verseItem.textEn,
      appLang: language,
      onStart: () => setSpeakingRef(verseItem.verseRef),
      onDone: () => setSpeakingRef(null),
      onError: () => setSpeakingRef(null),
    });
  };

  const copyVerse = async (verseItem: any) => {
    const text = language === 'en' && verseItem.textEn ? verseItem.textEn : verseItem.textAm;
    const bookName = language === 'am' ? verseItem.bookName : (verseItem.bookNameEn || verseItem.bookName);
    const full = `“${text}”\n— ${bookName} ${verseItem.chapter}:${verseItem.verse}`;
    await Clipboard.setStringAsync(full);

    if (Platform.OS === 'web') {
      console.log('Copied verse to clipboard');
    } else {
      Alert.alert(
        language === 'am' ? 'ተገልብጧል' : 'Copied',
        language === 'am' ? 'ጥቅሱ ወደ ቅንጥብ ሰሌዳ ተገልብጧል።' : 'Verse copied to clipboard.'
      );
    }
  };

  const shareVerse = async (verseItem: any) => {
    try {
      const text = language === 'am' ? verseItem.textAm : (verseItem.textEn || verseItem.textAm);
      const bookName = language === 'am' ? verseItem.bookName : (verseItem.bookNameEn || verseItem.bookName);
      const ref = `${bookName} ${verseItem.chapter}:${verseItem.verse}`;
      await Share.share({
        message: `“${text}”\n\n— ${ref}\n\nየኢትዮጵያ ኦርቶዶክስ 81 መጽሐፍ ቅዱስ`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const filteredVerses = useMemo(() => {
    if (!filterQuery.trim()) return bookmarkedVerses;
    const q = filterQuery.toLowerCase();
    return bookmarkedVerses.filter(v => {
      const am = v.textAm ? v.textAm.toLowerCase() : '';
      const en = v.textEn ? v.textEn.toLowerCase() : '';
      const bAm = v.bookName ? v.bookName.toLowerCase() : '';
      const bEn = v.bookNameEn ? v.bookNameEn.toLowerCase() : '';
      const ref = v.verseRef ? v.verseRef.toLowerCase() : '';
      return am.includes(q) || en.includes(q) || bAm.includes(q) || bEn.includes(q) || ref.includes(q);
    });
  }, [bookmarkedVerses, filterQuery]);

  const labels = {
    appTitle: '81 መጽሐፍ ቅዱስ',
    appSubTitle: language === 'am' ? 'ተወዳጅ ጥቅሶችና ማኅደሮች' : 'Saved Verses & Collections',
    badgeText: language === 'am' ? 'የተቀመጡ ጥቅሶች' : 'SAVED SCRIPTURES',
    title: language === 'am' ? 'ተወዳጅ ጥቅሶችና ማኅደሮች' : 'Saved Verses & Collections',
    subtitle:
      language === 'am'
        ? 'ለጸሎት፣ ለጥናትና ለመንፈሳዊ ማሰላሰያ ያስቀመጧቸው ቅዱሳት ቃላት'
        : 'Your personal treasury of sacred scriptures for prayer, study and reflection',
    all: language === 'am' ? 'ሁሉም ጥቅሶች' : 'All Verses',
    searchPlaceholder: language === 'am' ? 'ከተቀመጡ ጥቅሶች ይፈልጉ...' : 'Search within bookmarks...',
    emptyTitle: language === 'am' ? 'ምንም ተወዳጆች የሉም' : 'No Bookmarks Here Yet',
    emptySub:
      language === 'am'
        ? 'በንባብ ወቅት የጥቅሱን ቁጥር በመንካት ወይም ረዘም አድርገው በመጫን እዚህ ማስቀመጥ ይችላሉ።'
        : 'Tap a verse number circle or long-press any verse in the reader to save it here.',
    newColBtn: language === 'am' ? '+ አዲስ ማኅደር' : '+ New Collection',
    exploreBtn: language === 'am' ? 'ወደ መጻሕፍት ሂድ' : 'Explore Bible Books',
    listen: language === 'am' ? 'አዳምጥ' : 'Listen',
    stop: language === 'am' ? 'አቁም' : 'Stop',
    copy: language === 'am' ? 'ቅዳ' : 'Copy',
    share: language === 'am' ? 'አጋራ' : 'Share',
    readChapter: language === 'am' ? 'ምዕራፍ አንብብ' : 'Read Chapter',
  };

  // Render individual bookmark card matching Home page design
  const renderBookmarkCard = ({ item }: { item: any }) => {
    const bookTitle = language === 'am'
      ? item.bookName
      : language === 'both'
      ? `${item.bookName} (${item.bookNameEn})`
      : (item.bookNameEn || item.bookName);

    const isSpeakingThis = speakingRef === item.verseRef;

    return (
      <View
        style={[
          styles.bookmarkCard,
          {
            backgroundColor: surfaceColor,
            borderColor: borderColor,
            shadowColor: isDark ? '#000' : '#0a1128',
            shadowOpacity: isDark ? 0.08 : 0.04,
          },
          isSpeakingThis && styles.speakingBookmarkCard,
        ]}
      >
        {/* Card Header: Book & Chapter Badge + Quick Action Buttons */}
        <View style={styles.cardHeaderRow}>
          <TouchableOpacity
            style={styles.bookInfoLeft}
            onPress={() => router.push(`/read/${item.bookId}/${item.chapter}`)}
            activeOpacity={0.7}
          >
            <View style={styles.verseBadgeCircle}>
              <Ionicons name="bookmark" size={13} color="#e5a93c" />
            </View>
            <View>
              <Text style={styles.cardRefText} numberOfLines={1}>
                {bookTitle} {item.chapter}:{item.verse}
              </Text>
              <Text style={[styles.bookSubText, { color: textColor + '77' }]}>
                {language === 'am' ? `ምዕራፍ ${item.chapter}` : `Chapter ${item.chapter}`}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.cardHeaderRight}>
            <TouchableOpacity
              style={styles.readChapterPill}
              onPress={() => router.push(`/read/${item.bookId}/${item.chapter}`)}
              activeOpacity={0.75}
            >
              <Text style={styles.readChapterText}>{labels.readChapter}</Text>
              <Ionicons name="chevron-forward" size={12} color="#3b82f6" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.unbookmarkBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                  borderWidth: 1,
                  borderColor: isDark ? 'transparent' : 'rgba(15, 23, 42, 0.08)',
                },
              ]}
              onPress={() => toggleBookmark(item.verseRef)}
              activeOpacity={0.7}
              accessibilityLabel="Remove bookmark"
            >
              <Ionicons name="bookmark" size={18} color="#e5a93c" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Body: Scripture Text */}
        <TouchableOpacity
          onPress={() => router.push(`/read/${item.bookId}/${item.chapter}`)}
          activeOpacity={0.9}
        >
          {/* Amharic Text */}
          <Text style={[styles.bookmarkVerseAm, { color: textColor }]}>
            “{item.textAm}”
          </Text>

          {/* English Text if available */}
          {item.textEn ? (
            <Text style={[styles.bookmarkVerseEn, { color: textColor + 'bb' }]}>
              “{item.textEn}”
            </Text>
          ) : null}
        </TouchableOpacity>

        {/* Card Footer: Audio Listen, Copy, Share, Read Full */}
        <View style={[styles.cardFooterRow, { borderTopColor: borderColor }]}>
          <View style={styles.actionBtnsGroup}>
            <TouchableOpacity
              style={[
                styles.glassActionBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
                },
                isSpeakingThis && styles.activeSpeakingBtn,
              ]}
              onPress={() => speakVerse(item)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSpeakingThis ? 'pause' : 'volume-high'}
                size={14}
                color={isSpeakingThis ? '#080f21' : '#e5a93c'}
              />
              <Text
                style={[
                  styles.glassBtnText,
                  { color: isSpeakingThis ? '#080f21' : textColor },
                ]}
              >
                {isSpeakingThis ? labels.stop : labels.listen}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.glassActionBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
                },
              ]}
              onPress={() => copyVerse(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="copy-outline" size={14} color="#e5a93c" />
              <Text style={[styles.glassBtnText, { color: textColor }]}>{labels.copy}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.glassActionBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.04)',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
                },
              ]}
              onPress={() => shareVerse(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social-outline" size={14} color="#e5a93c" />
              <Text style={[styles.glassBtnText, { color: textColor }]}>{labels.share}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <AppScreenLayout subtitle={labels.appSubTitle}>
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#e5a93c" />
        </View>
      ) : (
        <FlatList
          key={isWidescreen ? 'grid_wide' : 'list_single'}
          data={filteredVerses}
          keyExtractor={item => item.verseRef}
          numColumns={isWidescreen ? 2 : 1}
          columnWrapperStyle={isWidescreen ? styles.columnWrapper : undefined}
          contentContainerStyle={[styles.listScrollContent, { paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Hero Section Banner */}
              <View
                style={[
                  styles.heroBannerCard,
                  {
                    backgroundColor: surfaceColor,
                    borderColor: isDark ? 'rgba(212, 175, 55, 0.22)' : 'rgba(212, 175, 55, 0.35)',
                    shadowColor: isDark ? '#000' : '#0a1128',
                    shadowOpacity: isDark ? 0.12 : 0.05,
                  },
                ]}
              >
                <View style={styles.badgeWrapper}>
                  <Ionicons name="bookmark" size={13} color="#e5a93c" />
                  <Text style={styles.badgeText}>{labels.badgeText}</Text>
                </View>

                <Text style={[styles.bannerTitle, { color: textColor }]}>
                  {labels.title}
                </Text>
                <Text style={[styles.bannerSubtitle, { color: textColor + '88' }]}>
                  {labels.subtitle}
                </Text>

                {/* Stats pills */}
                <View style={styles.statsPillRow}>
                  <View
                    style={[
                      styles.counterBadgePill,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.08)',
                      },
                    ]}
                  >
                    <Text style={styles.counterBadgeText}>
                      {bookmarks.length} {language === 'am' ? 'የተቀመጡ ጥቅሶች' : 'Saved Verses'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.counterBadgePill,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.08)',
                      },
                    ]}
                  >
                    <Text style={styles.counterBadgeText}>
                      {collections.length} {language === 'am' ? 'ማኅደሮች' : 'Collections'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Search within Bookmarks (Home Page Style) */}
              <View
                style={[
                  styles.searchBox,
                  {
                    backgroundColor: surfaceColor,
                    borderColor: borderColor,
                    shadowColor: isDark ? '#000' : '#0a1128',
                    shadowOpacity: isDark ? 0.06 : 0.04,
                  },
                ]}
              >
                <Ionicons name="search" size={18} color="#e5a93c" />
                <TextInput
                  style={[styles.searchInput, { color: textColor }]}
                  placeholder={labels.searchPlaceholder}
                  placeholderTextColor={textColor + '66'}
                  value={filterQuery}
                  onChangeText={setFilterQuery}
                />
                {filterQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setFilterQuery('')} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={18} color={textColor + '66'} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Collections Filter Pills (Matching Home Page Testament Pills) */}
              <View style={styles.collectionsSection}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.colScroll}
                >
                  {/* All Verses Pill */}
                  <TouchableOpacity
                    style={[
                      styles.pillBtn,
                      selectedCollectionId === 'all'
                        ? styles.activePillBtn
                        : [
                            styles.inactivePillBtn,
                            {
                              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                            },
                          ],
                    ]}
                    onPress={() => setSelectedCollectionId('all')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="bookmark"
                      size={14}
                      color={selectedCollectionId === 'all' ? '#080f21' : textColor + 'aa'}
                    />
                    <Text
                      style={[
                        styles.pillBtnText,
                        selectedCollectionId === 'all' ? styles.activePillText : { color: textColor + 'aa' },
                      ]}
                    >
                      {labels.all} ({bookmarks.length})
                    </Text>
                  </TouchableOpacity>

                  {/* Collection Pills */}
                  {collections.map(col => {
                    const isSelected = selectedCollectionId === col.id;
                    const displayName = language === 'am'
                      ? col.nameAm
                      : (language === 'both' ? `${col.nameAm} (${col.name})` : col.name);

                    return (
                      <TouchableOpacity
                        key={col.id}
                        style={[
                          styles.pillBtn,
                          isSelected
                            ? styles.activePillBtn
                            : [
                                styles.inactivePillBtn,
                                {
                                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                                },
                              ],
                        ]}
                        onPress={() => setSelectedCollectionId(col.id)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={(col.icon as any) || 'folder'}
                          size={14}
                          color={isSelected ? '#080f21' : textColor + 'aa'}
                        />
                        <Text
                          style={[
                            styles.pillBtnText,
                            isSelected ? styles.activePillText : { color: textColor + 'aa' },
                          ]}
                        >
                          {displayName} ({col.verseRefs.length})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* + New Collection Button */}
                  <TouchableOpacity
                    style={[
                      styles.newColBtn,
                      {
                        backgroundColor: isDark ? 'rgba(229, 169, 60, 0.12)' : 'rgba(229, 169, 60, 0.15)',
                        borderColor: isDark ? 'rgba(229, 169, 60, 0.3)' : 'rgba(229, 169, 60, 0.35)',
                      },
                    ]}
                    onPress={() => setShowNewColModal(prev => !prev)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={16} color="#e5a93c" />
                    <Text style={styles.newColBtnText}>{labels.newColBtn}</Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* Inline New Collection Bar */}
                {showNewColModal && (
                  <View style={[styles.newColDrawer, { backgroundColor: surfaceColor, borderColor }]}>
                    <TextInput
                      style={[
                        styles.newColInput,
                        { color: textColor, borderColor: 'rgba(212, 175, 55, 0.3)' },
                      ]}
                      placeholder={language === 'am' ? 'የአዲሱ ማኅደር ስም...' : 'New Collection Name...'}
                      placeholderTextColor={textColor + '66'}
                      value={newColTitle}
                      onChangeText={setNewColTitle}
                      autoFocus={true}
                    />
                    <TouchableOpacity
                      style={styles.newColSave}
                      onPress={handleCreateCollection}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.newColSaveText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowNewColModal(false)}
                      style={{ padding: 6 }}
                    >
                      <Ionicons name="close" size={20} color={textColor} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </>
          }
          renderItem={renderBookmarkCard}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <OrthodoxCross size={40} variant="gondar" glow={true} />
              </View>
              <Text style={[styles.emptyText, { color: textColor }]}>
                {labels.emptyTitle}
              </Text>
              <Text style={[styles.emptySubText, { color: textColor + '77' }]}>
                {labels.emptySub}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#e5a93c', '#d4af37']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.findVerseBtn}
                >
                  <Text style={styles.findVerseBtnText}>{labels.exploreBtn}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orthodoxCrossBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  crossEmoji: {
    fontSize: 20,
  },
  appMainTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  appSubTitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  hamburgerBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  bodyLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContentColumn: {
    flex: 1,
  },
  rightDashboardColumn: {
    width: 320,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.08)',
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 25, 0.7)',
  },
  drawerContent: {
    width: 270,
    height: '100%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
  },

  // Hero Section Banner Card (Home Page Style)
  heroBannerCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.22)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
  },
  badgeText: {
    color: '#e5a93c',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  bannerSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  statsPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  counterBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  counterBadgeText: {
    color: '#e5a93c',
    fontSize: 11,
    fontWeight: '700',
  },

  // Search Box (Home Page Style)
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },

  // Collections Section
  collectionsSection: {
    marginBottom: 14,
  },
  colScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  activePillBtn: {
    backgroundColor: '#e5a93c',
    borderColor: '#e5a93c',
  },
  inactivePillBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pillBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activePillText: {
    color: '#080f21',
    fontWeight: '900',
  },
  newColBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  newColBtnText: {
    color: '#e5a93c',
    fontSize: 12,
    fontWeight: '800',
  },
  newColDrawer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1,
  },
  newColInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  newColSave: {
    backgroundColor: '#e5a93c',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  newColSaveText: {
    color: '#080f21',
    fontWeight: '800',
    fontSize: 12,
  },

  // Bookmark Card (Home Page Style)
  bookmarkCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  speakingBookmarkCard: {
    borderColor: '#e5a93c',
    borderWidth: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bookInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  verseBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  cardRefText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#e5a93c',
  },
  bookSubText: {
    fontSize: 10,
    fontWeight: '500',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readChapterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
  },
  readChapterText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '700',
  },
  unbookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scripture Text Styling
  bookmarkVerseAm: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  bookmarkVerseEn: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 10,
  },

  // Card Footer Actions
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionBtnsGroup: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  glassActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeSpeakingBtn: {
    backgroundColor: '#e5a93c',
    borderColor: '#e5a93c',
  },
  glassBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Empty State (Home Page Style)
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 12.5,
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 19,
  },
  findVerseBtn: {
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  findVerseBtnText: {
    color: '#080f21',
    fontWeight: '900',
    fontSize: 13,
  },
});
