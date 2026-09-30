import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import AppScreenLayout from '@/components/AppScreenLayout';
import {
  getJournalEntries,
  deleteJournalEntry,
  JournalEntry,
  JournalCategory,
} from '@/lib/storage';

const CATEGORIES: Array<{ id: 'all' | JournalCategory; labelAm: string; labelEn: string; icon: string }> = [
  { id: 'all', labelAm: 'ሁሉም', labelEn: 'All', icon: 'apps' },
  { id: 'prayer', labelAm: 'ጸሎት', labelEn: 'Prayer', icon: 'hand-left' },
  { id: 'gratitude', labelAm: 'ምስጋና', labelEn: 'Gratitude', icon: 'heart' },
  { id: 'study', labelAm: 'ጥናት', labelEn: 'Bible Study', icon: 'book' },
  { id: 'reflection', labelAm: 'አስተንትኖ', labelEn: 'Reflection', icon: 'sparkles' },
  { id: 'notes', labelAm: 'ማስታወሻ', labelEn: 'Notes', icon: 'document-text' },
];

export default function JournalScreen() {
  const { width } = useWindowDimensions();
  const isWidescreen = width >= 1024;

  const { language, theme } = useBible();
  const isDark = theme === 'dark';

  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | JournalCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const loadEntries = async () => {
    const data = await getJournalEntries();
    setEntries(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      language === 'am' ? 'ማስታወሻ ይሰረዝ?' : 'Delete Entry?',
      language === 'am' ? 'ይህንን የጸሎት ማስታወሻ በእርግጥ መሰረዝ ይፈልጋሉ?' : 'Are you sure you want to delete this reflection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteJournalEntry(id);
            setEntries(updated);
          },
        },
      ]
    );
  };

  const filteredEntries = entries.filter(e => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.text && e.text.toLowerCase().includes(q))
    );
  });

  const labels = {
    appSubTitle: language === 'am' ? 'የጸሎትና አስተንትኖ ማስታወሻ' : 'Prayer Journal & Notes',
    badgeText: language === 'am' ? 'የጸሎት ማስታወሻ' : 'SPIRITUAL JOURNAL',
    title: language === 'am' ? 'የጸሎትና አስተንትኖ ማስታወሻ' : 'Prayer Journal & Notes',
    subtitle:
      language === 'am'
        ? 'ጸሎቶችዎን፣ ምስጋናዎችዎንና ከመጽሐፍ ቅዱስ ያገኙትን መንፈሳዊ አስተንትኖ እዚህ ይመዝግቡ።'
        : 'Record your prayers, thanksgiving, and spiritual reflections from the scriptures.',
    searchPlaceholder: language === 'am' ? 'በማስታወሻዎች ውስጥ ይፈልጉ...' : 'Search your journal...',
    empty: language === 'am' ? 'ምንም የጸሎት ማስታወሻ የለም' : 'Your journal is empty',
    emptySub:
      language === 'am'
        ? 'ጸሎቶችዎን፣ ምስጋናዎችዎንና የንባብ አስተንትኖዎችዎን መመዝገብ ይጀምሩ!'
        : 'Begin recording your prayers, spiritual reflections, and study notes.',
    newEntry: language === 'am' ? '+ አዲስ ጸሎት/ማስታወሻ' : '+ New Journal Entry',
  };

  const renderItem = ({ item }: { item: JournalEntry }) => {
    const formattedDate = new Date(item.date).toLocaleDateString(
      language === 'am' ? 'am-ET' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

    const categoryObj = CATEGORIES.find(c => c.id === item.category);

    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: surfaceColor,
            borderColor,
            shadowColor: isDark ? '#000' : '#0a1128',
            shadowOpacity: isDark ? 0.08 : 0.04,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.categoryBadgeRow}>
              {categoryObj && (
                <View style={styles.catBadge}>
                  <Ionicons name={(categoryObj.icon as any) || 'document-text'} size={12} color="#e5a93c" />
                  <Text style={styles.catBadgeText}>
                    {language === 'am' ? categoryObj.labelAm : categoryObj.labelEn}
                  </Text>
                </View>
              )}
              <Text style={[styles.cardDate, { color: textColor + '77' }]}>{formattedDate}</Text>
            </View>
            <Text style={[styles.cardTitle, { color: textColor }]}>
              {item.title || (language === 'am' ? 'ርዕስ የሌለው' : 'Untitled Entry')}
            </Text>
          </View>

          {/* Delete Action */}
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={[
              styles.deleteBtn,
              {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)',
              },
            ]}
            accessibilityLabel="Delete entry"
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <Text style={[styles.cardText, { color: textColor + 'cc' }]} numberOfLines={5}>
          {item.text}
        </Text>

        {/* Attached Verses Pills */}
        {item.verseRefs && item.verseRefs.length > 0 && (
          <View style={[styles.verseTagsRow, { borderTopColor: borderColor }]}>
            {item.verseRefs.map((ref, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.verseTag,
                  {
                    backgroundColor: isDark ? 'rgba(229, 169, 60, 0.12)' : 'rgba(229, 169, 60, 0.15)',
                    borderColor: isDark ? 'rgba(229, 169, 60, 0.25)' : 'rgba(229, 169, 60, 0.35)',
                  },
                ]}
                onPress={() => {
                  const parts = ref.split(':');
                  if (parts.length >= 2) router.push(`/read/${parts[0]}/${parts[1]}`);
                }}
              >
                <Ionicons name="book-outline" size={12} color="#e5a93c" />
                <Text style={styles.verseTagText}>{ref}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <AppScreenLayout
      subtitle={labels.appSubTitle}
      floatingAction={
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/journal/new')}
          activeOpacity={0.88}
          accessibilityLabel="Add journal entry"
        >
          <LinearGradient
            colors={['#e5a93c', '#d4af37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={26} color="#080f21" />
          </LinearGradient>
        </TouchableOpacity>
      }
    >
      <FlatList
        data={filteredEntries}
        keyExtractor={item => item.id}
        numColumns={isWidescreen ? 2 : 1}
        columnWrapperStyle={isWidescreen ? styles.columnWrapper : undefined}
        contentContainerStyle={[styles.listScrollContent, { paddingBottom: 60 }]}
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
                <Ionicons name="journal" size={13} color="#e5a93c" />
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
                    {entries.length} {language === 'am' ? 'ማስታወሻዎች' : 'Journal Entries'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Search Input Box */}
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: surfaceColor,
                  borderColor,
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
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={18} color={textColor + '66'} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter Pills (Matching Home & Bookmarks Segmented Style) */}
            <View style={styles.categoriesSection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catScroll}
              >
                {CATEGORIES.map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  const displayName = language === 'am' ? cat.labelAm : cat.labelEn;

                  return (
                    <TouchableOpacity
                      key={cat.id}
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
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={(cat.icon as any) || 'folder'}
                        size={14}
                        color={isSelected ? '#080f21' : textColor + 'aa'}
                      />
                      <Text
                        style={[
                          styles.pillBtnText,
                          isSelected ? styles.activePillText : { color: textColor + 'aa' },
                        ]}
                      >
                        {displayName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </>
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Ionicons name="journal-outline" size={36} color="#e5a93c" />
            </View>
            <Text style={[styles.emptyText, { color: textColor }]}>
              {labels.empty}
            </Text>
            <Text style={[styles.emptySubText, { color: textColor + '77' }]}>
              {labels.emptySub}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/journal/new')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#e5a93c', '#d4af37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.newEntryBtn}
              >
                <Text style={styles.newEntryBtnText}>{labels.newEntry}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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

  // Search Box
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

  // Categories Filter Pills
  categoriesSection: {
    marginBottom: 14,
  },
  catScroll: {
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

  // Journal Entry Card
  card: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
  },
  catBadgeText: {
    color: '#e5a93c',
    fontSize: 10,
    fontWeight: '800',
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  verseTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  verseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  verseTagText: {
    color: '#e5a93c',
    fontSize: 11,
    fontWeight: '700',
  },

  // Empty State
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
  newEntryBtn: {
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  newEntryBtnText: {
    color: '#080f21',
    fontWeight: '900',
    fontSize: 13,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
