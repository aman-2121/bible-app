import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { searchBibleAdvanced, SearchResultVerse } from '@/lib/search';
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
} from '@/lib/storage';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useBible } from '@/context/BibleContext';
import AppScreenLayout from '@/components/AppScreenLayout';
import OrthodoxCross from '@/components/OrthodoxCross';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';

export default function SearchScreen() {
  const { width } = useWindowDimensions();
  const isWidescreen = width >= 1024;

  const { language, theme } = useBible();
  const isDark = theme === 'dark';

  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Filter Options
  const [testamentFilter, setTestamentFilter] = useState<'all' | 'old' | 'new'>('all');
  const [exactPhrase, setExactPhrase] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | undefined>(undefined);
  const [showBookFilter, setShowBookFilter] = useState(false);

  useEffect(() => {
    getSearchHistory().then(setHistory);
  }, []);

  const executeSearch = async (searchTerm = query) => {
    const clean = searchTerm.trim();
    if (!clean) return;

    setLoading(true);
    const updatedHistory = await addSearchHistory(clean);
    setHistory(updatedHistory);

    const res = await searchBibleAdvanced(clean, language, {
      testament: testamentFilter,
      bookId: selectedBookId,
      exactPhrase,
      maxResults: 60,
    });

    setResults(res);
    setLoading(false);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
    setHistory([]);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const onSelectHistoryItem = (item: string) => {
    setQuery(item);
    executeSearch(item);
  };

  const jumpToReader = (bookId: string, chapterId: string) => {
    router.push(`/read/${bookId}/${chapterId}`);
  };

  const labels = {
    appSubTitle: language === 'am' ? 'የመጽሐፍ ቅዱስ ፍለጋ' : 'Bible Search & Concordance',
    badgeText: language === 'am' ? 'ፍለጋ' : 'SCRIPTURE SEARCH',
    title: language === 'am' ? 'የመጽሐፍ ቅዱስ ፍለጋ' : 'Bible Search & Concordance',
    subtitle:
      language === 'am'
        ? 'በ81ዱ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቅዱሳት መጻሕፍት ውስጥ ቃላትንና ጥቅሶችን ይፈልጉ።'
        : 'Search verses, phrases, and keywords across all 81 canonical books.',
    placeholder: language === 'am' ? 'ጥቅስ ወይም ቃል ይፈልጉ...' : 'Search verse or keywords...',
    allTestaments: language === 'am' ? 'ሁሉም (81)' : 'All (81)',
    oldTestament: language === 'am' ? 'ብሉይ ኪዳን' : 'Old Test.',
    newTestament: language === 'am' ? 'ሐዲስ ኪዳን' : 'New Test.',
    exactPhrase: language === 'am' ? 'ትክክለኛ ሐረግ' : 'Exact Phrase',
    recentSearches: language === 'am' ? 'የቅርብ ፍለጋዎች' : 'Recent Searches',
    clear: language === 'am' ? 'አጽዳ' : 'Clear',
    resultsCount: (count: number) =>
      language === 'am' ? `${count} ጥቅሶች ተገኝተዋል` : `${count} verses found`,
    noResult: language === 'am' ? 'ምንም ጥቅስ አልተገኘም' : 'No verses found matching your query',
    tryDifferent: language === 'am' ? 'ፊደላትን ወይም ቃላትን ቀይረው ይሞክሩ' : 'Try checking your spelling or using fewer keywords',
    emptyPrompt: language === 'am' ? 'የሚፈልጉትን ቃል ከላይ ያስገቡ' : 'Type a word or phrase above to search all 81 books',
    readChapter: language === 'am' ? 'ምዕራፍ አንብብ' : 'Read Chapter',
  };

  const selectedBookName = BIBLE_BOOKS.find(b => b.id === selectedBookId)?.name;

  return (
    <AppScreenLayout subtitle={labels.appSubTitle}>
      <FlatList
        data={results}
        keyExtractor={item => item.verseRef}
        numColumns={isWidescreen ? 2 : 1}
        columnWrapperStyle={isWidescreen ? styles.columnWrapper : undefined}
        contentContainerStyle={[styles.listScrollContent, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Hero Section Banner (Matching Home & Bookmarks Design System) */}
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
                <Ionicons name="search" size={13} color="#e5a93c" />
                <Text style={styles.badgeText}>{labels.badgeText}</Text>
              </View>

              <Text style={[styles.bannerTitle, { color: textColor }]}>
                {labels.title}
              </Text>
              <Text style={[styles.bannerSubtitle, { color: textColor + '88' }]}>
                {labels.subtitle}
              </Text>
            </View>

            {/* Search Input Box */}
            <View
              style={[
                styles.searchBarContainer,
                {
                  backgroundColor: surfaceColor,
                  borderColor,
                  shadowColor: isDark ? '#000' : '#0a1128',
                  shadowOpacity: isDark ? 0.06 : 0.04,
                },
              ]}
            >
              <Ionicons name="search" size={18} color="#e5a93c" style={styles.searchIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder={labels.placeholder}
                placeholderTextColor={textColor + '66'}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => executeSearch()}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={clearSearch} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={18} color={textColor + '66'} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.searchSubmitBtn}
                onPress={() => executeSearch()}
                activeOpacity={0.8}
              >
                <Text style={styles.searchSubmitText}>Search</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Pills Row */}
            <View style={styles.filterSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {/* Testament Toggle Pills */}
                {(['all', 'old', 'new'] as const).map(t => {
                  const isSelected = testamentFilter === t;
                  const label = t === 'all' ? labels.allTestaments : t === 'old' ? labels.oldTestament : labels.newTestament;

                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => {
                        setTestamentFilter(t);
                        if (query.trim()) executeSearch();
                      }}
                      style={[
                        styles.filterChip,
                        isSelected
                          ? styles.filterChipActive
                          : [
                              styles.filterChipInactive,
                              {
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                              },
                            ],
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isSelected ? styles.filterChipTextActive : { color: textColor + 'aa' },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Exact Phrase Toggle */}
                <TouchableOpacity
                  onPress={() => {
                    setExactPhrase(!exactPhrase);
                    if (query.trim()) executeSearch();
                  }}
                  style={[
                    styles.filterChip,
                    exactPhrase
                      ? styles.filterChipActive
                      : [
                          styles.filterChipInactive,
                          {
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                          },
                        ],
                  ]}
                >
                  <Ionicons
                    name={exactPhrase ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={exactPhrase ? '#080f21' : textColor + 'aa'}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      exactPhrase ? styles.filterChipTextActive : { color: textColor + 'aa' },
                    ]}
                  >
                    {labels.exactPhrase}
                  </Text>
                </TouchableOpacity>

                {/* Book Filter Button */}
                <TouchableOpacity
                  onPress={() => setShowBookFilter(!showBookFilter)}
                  style={[
                    styles.filterChip,
                    selectedBookId
                      ? styles.filterChipActive
                      : [
                          styles.filterChipInactive,
                          {
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                          },
                        ],
                  ]}
                >
                  <Ionicons
                    name="book-outline"
                    size={14}
                    color={selectedBookId ? '#080f21' : textColor + 'aa'}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedBookId ? styles.filterChipTextActive : { color: textColor + 'aa' },
                    ]}
                  >
                    {selectedBookName ? `${selectedBookName} ✕` : (language === 'am' ? 'በመጽሐፍ መርጥ' : 'Filter by Book')}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Book Filter Drawer */}
            {showBookFilter && (
              <View
                style={[
                  styles.bookPickerDrawer,
                  {
                    backgroundColor: surfaceColor,
                    borderColor,
                    shadowColor: isDark ? '#000' : '#0a1128',
                    shadowOpacity: isDark ? 0.08 : 0.04,
                  },
                ]}
              >
                <View style={styles.bookDrawerHeader}>
                  <Text style={[styles.bookDrawerTitle, { color: textColor }]}>
                    {language === 'am' ? 'መጽሐፍ ይምረጡ' : 'Select a Book'}
                  </Text>
                  {selectedBookId && (
                    <TouchableOpacity onPress={() => setSelectedBookId(undefined)}>
                      <Text style={{ color: '#e5a93c', fontWeight: '800', fontSize: 12 }}>
                        {language === 'am' ? 'ሁሉንም መጻሕፍት' : 'Reset'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bookChips}>
                  {BIBLE_BOOKS.map(b => (
                    <TouchableOpacity
                      key={b.id}
                      onPress={() => {
                        setSelectedBookId(selectedBookId === b.id ? undefined : b.id);
                        setShowBookFilter(false);
                      }}
                      style={[
                        styles.bookChip,
                        selectedBookId === b.id
                          ? { backgroundColor: '#e5a93c', borderColor: '#e5a93c' }
                          : {
                              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                            },
                      ]}
                    >
                      <Text
                        style={[
                          styles.bookChipText,
                          selectedBookId === b.id
                            ? { color: '#080f21', fontWeight: '800' }
                            : { color: textColor },
                        ]}
                      >
                        {language === 'en' ? b.nameEn : b.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Recent Searches */}
            {query.length === 0 && history.length > 0 && results.length === 0 && (
              <View style={styles.historyContainer}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyTitle, { color: textColor + '88' }]}>{labels.recentSearches}</Text>
                  <TouchableOpacity onPress={handleClearHistory}>
                    <Text style={[styles.historyClear, { color: '#e5a93c' }]}>{labels.clear}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.historyPills}>
                  {history.map(item => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.historyPill,
                        {
                          backgroundColor: surfaceColor,
                          borderColor,
                          shadowColor: isDark ? '#000' : '#0a1128',
                          shadowOpacity: isDark ? 0.06 : 0.04,
                        },
                      ]}
                      onPress={() => onSelectHistoryItem(item)}
                    >
                      <Ionicons name="time-outline" size={14} color="#e5a93c" />
                      <Text style={[styles.historyPillText, { color: textColor }]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Results count header */}
            {results.length > 0 && (
              <View style={styles.resultsBadgeRow}>
                <Ionicons name="checkmark-done" size={16} color="#e5a93c" />
                <Text style={[styles.resultsCountText, { color: textColor + 'aa' }]}>
                  {labels.resultsCount(results.length)}
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.resultCard,
              {
                backgroundColor: surfaceColor,
                borderColor,
                shadowColor: isDark ? '#000' : '#0a1128',
                shadowOpacity: isDark ? 0.08 : 0.04,
              },
            ]}
            onPress={() => jumpToReader(item.bookId, item.chapter)}
            activeOpacity={0.82}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardBookBadge}>
                <Ionicons name="bookmark" size={13} color="#e5a93c" />
                <Text style={styles.cardBookText}>
                  {language === 'en' ? item.bookNameEn : item.bookName} {item.chapter}:{item.verse}
                </Text>
              </View>
              <View style={styles.readPill}>
                <Text style={styles.readPillText}>{labels.readChapter}</Text>
                <Ionicons name="chevron-forward" size={12} color="#3b82f6" />
              </View>
            </View>

            <Text style={[styles.verseAm, { color: textColor }]}>{item.textAm}</Text>

            {item.textEn && language !== 'am' && (
              <Text style={[styles.verseEn, { color: textColor + '88' }]}>{item.textEn}</Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#e5a93c" />
              <Text style={[styles.loadingText, { color: textColor + 'aa' }]}>
                {language === 'am' ? '81ዱን መጻሕፍት እየፈለገ ነው...' : 'Searching canonical 81 books...'}
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <OrthodoxCross size={40} variant="axum" glow={!query} />
              </View>
              <Text style={[styles.emptyText, { color: textColor }]}>
                {query ? labels.noResult : labels.emptyPrompt}
              </Text>
              <Text style={[styles.emptySubText, { color: textColor + '77' }]}>
                {query ? labels.tryDifferent : labels.subtitle}
              </Text>
            </View>
          )
        }
      />
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  },

  // Search Input Box
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  searchIcon: {
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
  searchSubmitBtn: {
    backgroundColor: '#e5a93c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  searchSubmitText: {
    color: '#080f21',
    fontWeight: '800',
    fontSize: 11.5,
  },

  // Filter Section
  filterSection: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: '#e5a93c',
    borderColor: '#e5a93c',
  },
  filterChipInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#080f21',
    fontWeight: '900',
  },

  // Book Drawer
  bookPickerDrawer: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
  },
  bookDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookDrawerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  bookChips: {
    flexDirection: 'row',
    gap: 6,
  },
  bookChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  bookChipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // History Section
  historyContainer: {
    marginBottom: 14,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyClear: {
    fontSize: 12,
    fontWeight: '800',
  },
  historyPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  historyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 1,
  },
  historyPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Results Count Badge
  resultsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  resultsCountText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Result Card
  resultCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBookBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardBookText: {
    color: '#e5a93c',
    fontSize: 13,
    fontWeight: '800',
  },
  readPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  readPillText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '700',
  },
  verseAm: {
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 4,
  },
  verseEn: {
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // Loading & Empty States
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
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
});
