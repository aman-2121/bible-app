import React, { useState, useMemo, useEffect } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ImageBackground,
  Share,
  useWindowDimensions,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { speakBibleText, stopSpeech } from '@/lib/tts';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import BookCard from '@/components/BookCard';
import ContinueReadingCard from '@/components/ContinueReadingCard';
import AppScreenLayout from '@/components/AppScreenLayout';
import DevotionalDashboard from '@/components/DevotionalDashboard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useBible } from '@/context/BibleContext';
import { getRandomVerse, getDailyVerse } from '@/lib/bibleLoader';
import { getBookmarks, getJournalEntries, getPlanProgress } from '@/lib/storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// 16 JPG Background Images for Daily Verse Hero
const heroImages = [
  require('@/assets/images/hero1.jpg'),
  require('@/assets/images/hero2.jpg'),
  require('@/assets/images/hero3.jpg'),
  require('@/assets/images/hero4.jpg'),
  require('@/assets/images/download.jpg'),
  require('@/assets/images/download (1).jpg'),
  require('@/assets/images/download (2).jpg'),
  require('@/assets/images/download (3).jpg'),
  require('@/assets/images/download (4).jpg'),
  require('@/assets/images/download (5).jpg'),
  require('@/assets/images/download (6).jpg'),
  require('@/assets/images/download (7).jpg'),
  require('@/assets/images/download (8).jpg'),
  require('@/assets/images/download (9).jpg'),
  require('@/assets/images/download (10).jpg'),
  require('@/assets/images/download (11).jpg'),
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWidescreen = width >= 1024;

  const { language, theme } = useBible();
  const isDark = theme === 'dark';
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [selectedTestament, setSelectedTestament] = useState<'old' | 'new' | 'all'>('old');
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Quick Access Dynamic Badges
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [plansCount, setPlansCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);

  useEffect(() => {
    getDailyVerse().then(setDailyVerse);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getBookmarks().then(bm => setBookmarksCount(bm.length));
      getJournalEntries().then(jn => setJournalCount(jn.length));
      getPlanProgress().then(pr => setPlansCount(Object.keys(pr).length));
    }, [])
  );

  const randomHeroImage = useMemo(() => {
    return heroImages[Math.floor(Math.random() * heroImages.length)];
  }, []);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Automatically switch audio language when user changes language
  useEffect(() => {
    if (isSpeaking && dailyVerse) {
      speakBibleText({
        textAm: dailyVerse.textAm,
        textEn: dailyVerse.textEn,
        appLang: language,
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [language]);

  // Audio Playback for Daily Verse
  const toggleListen = async () => {
    if (isSpeaking) {
      await stopSpeech();
      setIsSpeaking(false);
    } else if (dailyVerse) {
      await speakBibleText({
        textAm: dailyVerse.textAm,
        textEn: dailyVerse.textEn,
        appLang: language,
        onStart: () => setIsSpeaking(true),
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const onShare = async () => {
    if (!dailyVerse) return;
    try {
      const verse = language === 'am' ? dailyVerse.textAm : dailyVerse.textEn;
      const ref =
        language === 'am'
          ? `${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`
          : `${dailyVerse.bookNameEn} ${dailyVerse.chapter}:${dailyVerse.verse}`;

      await Share.share({
        message: `“${verse}”\n\n— ${ref}\n\nየኢትዮጵያ ኦርቶዶክስ 81 መጽሐፍ ቅዱስ (Mezamurit)`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const filteredBooks = useMemo(() => {
    if (selectedTestament === 'all') return BIBLE_BOOKS;
    return BIBLE_BOOKS.filter(b => b.testament === selectedTestament);
  }, [selectedTestament]);

  const labels = {
    dailyVerseBadge: 'DAILY VERSE',
    quickAccess: language === 'am' ? 'ፈጣን አገልግሎቶች' : 'Quick Access',
    bookmarks: language === 'am' ? 'ተወዳጆች' : 'Bookmarks',
    plans: language === 'am' ? 'የንባብ ዕቅዶች' : 'Reading Plans',
    journal: language === 'am' ? 'ማስታወሻ' : 'Journal',
    search: language === 'am' ? 'ፍለጋ' : 'Search',
    bible: language === 'am' ? 'መጽሐፍ ቅዱስ' : 'Bible',
    viewAll: language === 'am' ? 'ሁሉንም እይ >' : 'View All >',
    oldTestament: language === 'am' ? 'ብሉይ ኪዳን (46)' : 'Old Testament (46)',
    newTestament: language === 'am' ? 'ሐዲስ ኪዳን (35)' : 'New Testament (35)',
    allBooks: language === 'am' ? 'ሁሉም (81)' : 'All Books (81)',
    listen: isSpeaking ? (language === 'am' ? 'አቁም' : 'Stop') : (language === 'am' ? 'አዳምጥ' : 'Listen'),
    share: language === 'am' ? 'አጋራ' : 'Share',
  };

  // 1. Daily Verse Hero Component
  const DailyVerseHero = () => (
    <ImageBackground
      source={randomHeroImage}
      style={styles.heroCard}
      imageStyle={{ borderRadius: 24 }}
      resizeMode="cover"
    >
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(5, 10, 25, 0.6)', borderRadius: 24 }]} />

      <View style={styles.heroTopBadgeRow}>
        <View style={styles.badgeWrapper}>
          <Ionicons name="book" size={14} color="#e5a93c" />
          <Text style={styles.badgeText}>{labels.dailyVerseBadge}</Text>
        </View>
      </View>

      {/* Amharic Scripture */}
      <Text style={styles.amharicVerseText}>
        {dailyVerse ? `“${dailyVerse.textAm}”` : '“እግዚአብሔር እንዲሁ ዓለሙን ወዶአልና አንድያ ልጁን እስኪሰጥ ድረስ፤ በእርሱ የሚያምን ሁሉ የዘላለም ሕይወት እንዲኖረው እንጂ እንዳይጠፋ።”'}
      </Text>

      {/* English Scripture */}
      <Text style={styles.englishVerseText}>
        {dailyVerse?.textEn
          ? `“${dailyVerse.textEn}”`
          : '“For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.”'}
      </Text>

      {/* Verse Reference & Action Buttons */}
      <View style={styles.heroFooterRow}>
        <Text style={styles.verseRefText}>
          {dailyVerse
            ? `${dailyVerse.bookNameEn || dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse}   |   ${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`
            : 'John 3:16   |   ዮሐንስ 3:16'}
        </Text>

        <View style={styles.heroBtnsGroup}>
          <TouchableOpacity style={styles.glassActionBtn} onPress={toggleListen} activeOpacity={0.8}>
            <Ionicons name={isSpeaking ? 'pause' : 'volume-high'} size={15} color="#fff" />
            <Text style={styles.glassBtnText}>{labels.listen}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.glassActionBtn} onPress={onShare} activeOpacity={0.8}>
            <Ionicons name="share-social-outline" size={15} color="#fff" />
            <Text style={styles.glassBtnText}>{labels.share}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );

  // 2. Quick Access Row Component
  const QuickAccessRow = () => {
    const quickCardDynamicStyle = [
      styles.quickCard,
      {
        backgroundColor: surfaceColor,
        borderColor: borderColor,
        shadowColor: isDark ? '#000' : '#0a1128',
        shadowOpacity: isDark ? 0.08 : 0.04,
      },
    ];

    const badgePillDynamicStyle = [
      styles.badgePill,
      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.06)' },
    ];

    const badgePillTextDynamicStyle = [
      styles.badgePillText,
      { color: isDark ? '#fff' : textColor },
    ];

    return (
      <View style={styles.quickAccessSection}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>{labels.quickAccess}</Text>
        <View style={styles.quickCardsRow}>
          {/* Bookmarks */}
          <TouchableOpacity
            style={quickCardDynamicStyle}
            onPress={() => router.push('/(tabs)/bookmarks')}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.18)' }]}>
              <Ionicons name="bookmark" size={18} color="#8b5cf6" />
            </View>
            <View style={badgePillDynamicStyle}>
              <Text style={badgePillTextDynamicStyle}>{bookmarksCount}</Text>
            </View>
            <Text style={[styles.quickLabel, { color: textColor }]}>{labels.bookmarks}</Text>
            <Ionicons name="chevron-forward" size={14} color={textColor + '66'} style={styles.quickChevron} />
          </TouchableOpacity>

          {/* Reading Plans */}
          <TouchableOpacity
            style={quickCardDynamicStyle}
            onPress={() => router.push('/(tabs)/plans')}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.18)' }]}>
              <Ionicons name="calendar" size={18} color="#3b82f6" />
            </View>
            <View style={badgePillDynamicStyle}>
              <Text style={badgePillTextDynamicStyle}>{plansCount}</Text>
            </View>
            <Text style={[styles.quickLabel, { color: textColor }]}>{labels.plans}</Text>
            <Ionicons name="chevron-forward" size={14} color={textColor + '66'} style={styles.quickChevron} />
          </TouchableOpacity>

          {/* Journal */}
          <TouchableOpacity
            style={quickCardDynamicStyle}
            onPress={() => router.push('/(tabs)/journal')}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.18)' }]}>
              <Ionicons name="create" size={18} color="#10b981" />
            </View>
            <View style={badgePillDynamicStyle}>
              <Text style={badgePillTextDynamicStyle}>{journalCount}</Text>
            </View>
            <Text style={[styles.quickLabel, { color: textColor }]}>{labels.journal}</Text>
            <Ionicons name="chevron-forward" size={14} color={textColor + '66'} style={styles.quickChevron} />
          </TouchableOpacity>

          {/* Search */}
          <TouchableOpacity
            style={quickCardDynamicStyle}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.85}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: 'rgba(244, 63, 94, 0.18)' }]}>
              <Ionicons name="search" size={18} color="#f43f5e" />
            </View>
            <Text style={[styles.quickLabel, { color: textColor }]}>{labels.search}</Text>
            <Ionicons name="chevron-forward" size={14} color={textColor + '66'} style={styles.quickChevron} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 3. Main Center Stream
  const MainContentFeed = () => (
    <FlatList
      data={filteredBooks}
      keyExtractor={item => item.id}
      numColumns={isWidescreen ? 3 : 2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.listScrollContent, { paddingBottom: 40 }]}
      columnWrapperStyle={styles.columnWrapper}
      ListHeaderComponent={
        <>
          {/* Daily Verse Hero */}
          <DailyVerseHero />

          {/* Continue Reading Card */}
          <ContinueReadingCard />

          {/* Quick Access Grid */}
          <QuickAccessRow />

          {/* Bible Section Header & Testament Pills */}
          <View style={styles.bibleHeaderSection}>
            <View style={styles.bibleTitleRow}>
              <View style={styles.bibleHeadingLeft}>
                <Ionicons name="book" size={20} color="#e5a93c" />
                <Text style={[styles.bibleTitleText, { color: textColor }]}>{labels.bible}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTestament('all')}>
                <Text style={styles.viewAllText}>{labels.viewAll}</Text>
              </TouchableOpacity>
            </View>

            {/* Segmented Filter Pills */}
            <View style={styles.testamentPillsRow}>
              <TouchableOpacity
                onPress={() => setSelectedTestament('old')}
                style={[
                  styles.pillBtn,
                  selectedTestament === 'old'
                    ? styles.activePillBtn
                    : [
                        styles.inactivePillBtn,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                        },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.pillBtnText,
                    selectedTestament === 'old' ? styles.activePillText : { color: textColor + 'aa' },
                  ]}
                >
                  {labels.oldTestament}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedTestament('new')}
                style={[
                  styles.pillBtn,
                  selectedTestament === 'new'
                    ? styles.activePillBtn
                    : [
                        styles.inactivePillBtn,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                        },
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.pillBtnText,
                    selectedTestament === 'new' ? styles.activePillText : { color: textColor + 'aa' },
                  ]}
                >
                  {labels.newTestament}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      }
      renderItem={({ item }) => <BookCard bookId={item.id} />}
      ListFooterComponent={
        !isWidescreen ? (
          <View style={styles.mobileDevotionalSection}>
            <DevotionalDashboard />
          </View>
        ) : null
      }
    />
  );

  return (
    <AppScreenLayout
      rightContent={
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 12 }}
        >
          <DevotionalDashboard />
        </ScrollView>
      }
    >
      <MainContentFeed />
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
  bodyLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContentColumn: {
    flex: 1,
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
  listScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },

  // Daily Verse Hero Card
  heroCard: {
    marginHorizontal: 6,
    borderRadius: 24,
    padding: 18,
    marginBottom: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  heroTopBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  badgeText: {
    color: '#e5a93c',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  amharicVerseText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  englishVerseText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 14,
  },
  heroFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    flexWrap: 'wrap',
    gap: 10,
  },
  verseRefText: {
    color: '#e5a93c',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroBtnsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  glassActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  glassBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // Quick Access Section
  quickAccessSection: {
    marginHorizontal: 6,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  quickCardsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  quickCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'flex-start',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  quickIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgePill: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgePillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  quickChevron: {
    position: 'absolute',
    bottom: 12,
    right: 10,
  },

  // Bible Shelf Header & Pills
  bibleHeaderSection: {
    marginHorizontal: 6,
    marginTop: 10,
    marginBottom: 12,
  },
  bibleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bibleHeadingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bibleTitleText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  viewAllText: {
    color: '#3b82f6',
    fontSize: 13,
    fontWeight: '700',
  },
  testamentPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 16,
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
    fontSize: 13,
    fontWeight: '700',
  },
  activePillText: {
    color: '#080f21',
    fontWeight: '900',
  },

  // Mobile Devotional Bottom Section
  mobileDevotionalSection: {
    marginTop: 20,
    paddingHorizontal: 6,
  },
});
