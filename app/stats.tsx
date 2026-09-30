import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getReadingStats,
  getStreak,
  getBookmarks,
  getHighlights,
  getJournalEntries,
  getAchievements,
  Achievement,
  ReadingStats,
  StreakData,
} from '@/lib/storage';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useBible } from '@/context/BibleContext';
import AppScreenLayout from '@/components/AppScreenLayout';

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const { language, theme } = useBible();
  const isDark = theme === 'dark';
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const [stats, setStats] = useState<ReadingStats>({ chaptersRead: [], openedBooks: [], totalReadingMinutes: 0 });
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastReadDate: null, longestStreak: 0, history: [] });
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [highlightsCount, setHighlightsCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const loadAllStats = async () => {
    const s = await getReadingStats();
    const st = await getStreak();
    const bm = await getBookmarks();
    const hl = await getHighlights();
    const jn = await getJournalEntries();
    const ach = await getAchievements();

    setStats(s);
    setStreak(st);
    setBookmarksCount(bm.length);
    setHighlightsCount(hl.length);
    setJournalCount(jn.length);
    setAchievements(ach);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAllStats();
    }, [])
  );

  // Real Calculations from BIBLE_BOOKS and real user state
  const totalCanonicalChapters = BIBLE_BOOKS.reduce((sum, b) => sum + b.chapters, 0); // 1,327 chapters
  const otBooks = BIBLE_BOOKS.filter(b => b.testament === 'old');
  const ntBooks = BIBLE_BOOKS.filter(b => b.testament === 'new');
  const otTotalChapters = otBooks.reduce((sum, b) => sum + b.chapters, 0);
  const ntTotalChapters = ntBooks.reduce((sum, b) => sum + b.chapters, 0);

  const chaptersReadCount = stats.chaptersRead.length;
  const otChaptersRead = stats.chaptersRead.filter(k => {
    const bId = k.split(':')[0];
    return otBooks.some(b => b.id === bId);
  }).length;
  const ntChaptersRead = stats.chaptersRead.filter(k => {
    const bId = k.split(':')[0];
    return ntBooks.some(b => b.id === bId);
  }).length;

  const completedBooks = BIBLE_BOOKS.filter(b => {
    for (let c = 1; c <= b.chapters; c++) {
      if (!stats.chaptersRead.includes(`${b.id}:${c}`)) return false;
    }
    return true;
  });
  const completedBooksCount = completedBooks.length;

  const overallProgressPct = totalCanonicalChapters > 0
    ? ((chaptersReadCount / totalCanonicalChapters) * 100).toFixed(1)
    : '0';

  const otProgressPct = otTotalChapters > 0
    ? ((otChaptersRead / otTotalChapters) * 100).toFixed(1)
    : '0';

  const ntProgressPct = ntTotalChapters > 0
    ? ((ntChaptersRead / ntTotalChapters) * 100).toFixed(1)
    : '0';

  // Estimated verses read from completed chapters (~26 verses/chapter average in the Bible)
  const estimatedVersesRead = chaptersReadCount * 26;

  const hours = Math.floor((stats.totalReadingMinutes || 0) / 60);
  const minutes = (stats.totalReadingMinutes || 0) % 60;
  const timeFormatted = `${hours}h ${minutes}m`;

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalAchievements = achievements.length;

  // Real Weekly Reading Activity (7 days from 6 days ago up to today)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesAm = ['እሁድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'];
    const dayIndex = d.getDay();
    const isRead = (streak.history && streak.history.includes(dateStr)) || streak.lastReadDate === dateStr;
    const isToday = i === 6;
    return {
      dateStr,
      dayLabel: language === 'am' ? dayNamesAm[dayIndex] : dayNamesEn[dayIndex],
      dayNum: d.getDate(),
      isRead,
      isToday,
    };
  });

  const activeDaysThisWeek = last7Days.filter(d => d.isRead).length;

  const labels = {
    title: language === 'am' ? 'የንባብ ስታትስቲክስ' : (language === 'both' ? 'የንባብ ስታትስቲክስ / Reading Statistics' : 'Reading Statistics'),
    subtitle: language === 'am' ? 'የእውነተኛ ንባብ ጉዞና ውጤቶች' : 'Real Reading Journey & Analytics',
    overview: language === 'am' ? 'ዋና ዋና መረጃዎች' : 'Core Metrics',
    currentStreak: language === 'am' ? 'የአሁን ጽናት' : 'Current Streak',
    longestStreak: language === 'am' ? 'ረጅሙ ጽናት' : 'Longest Streak',
    days: language === 'am' ? 'ቀናት' : 'Days',
    chaptersRead: language === 'am' ? 'የተነበቡ ምዕራፎች' : 'Chapters Read',
    booksCompleted: language === 'am' ? 'የተጠናቀቁ መጻሕፍት' : 'Books Completed',
    booksExplored: language === 'am' ? 'የተከፈቱ መጻሕፍት' : 'Books Explored',
    versesRead: language === 'am' ? 'የተነበቡ ጥቅሶች' : 'Verses Read',
    bookmarks: language === 'am' ? 'ተወዳጅ ጥቅሶች' : 'Bookmarks Saved',
    highlights: language === 'am' ? 'የተቀለሙ ጥቅሶች' : 'Verses Highlighted',
    journal: language === 'am' ? 'የጸሎት ማስታወሻዎች' : 'Journal Entries',
    readingTime: language === 'am' ? 'አጠቃላይ የንባብ ጊዜ' : 'Total Reading Time',
    overallProgress: language === 'am' ? 'አጠቃላይ የመጽሐፍ ቅዱስ ንባብ ሂደት' : 'Overall Bible Progress',
    canonical81: language === 'am' ? '81ዱ የኢትዮጵያ ኦርቶዶክስ ቅዱሳት መጻሕፍት' : 'Ethiopian Orthodox 81 Books',
    ot: language === 'am' ? 'ብሉይ ኪዳን' : 'Old Testament',
    nt: language === 'am' ? 'ሐዲስ ኪዳን' : 'New Testament',
    weeklyActivity: language === 'am' ? 'የሳምንት ንባብ እንቅስቃሴ' : 'Weekly Reading Activity',
    activeDaysSummary: language === 'am' ? `በዚህ ሳምንት ${activeDaysThisWeek} ከ 7 ቀናት አንብበዋል` : `${activeDaysThisWeek} of 7 days read this week`,
    achievements: language === 'am' ? 'ሽልማቶችና ውጤቶች' : 'Milestones & Achievements',
    unlockedBadge: language === 'am' ? `${unlockedCount} ከ ${totalAchievements} ተሳክቷል` : `${unlockedCount} of ${totalAchievements} Unlocked`,
  };

  return (
    <AppScreenLayout
      title={labels.title}
      subtitle={labels.subtitle}
      showBackBtn={true}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Streak & Journey Hero Card */}
        <LinearGradient
          colors={isDark ? ['#0e172a', '#14203d'] : ['#ffffff', '#f8fafc']}
          style={[styles.heroBanner, { borderColor }]}
        >
          <View style={styles.streakBannerTop}>
            <View style={styles.streakLeft}>
              <View style={[styles.streakIconCircle, { backgroundColor: isDark ? 'rgba(229, 169, 60, 0.15)' : 'rgba(229, 169, 60, 0.12)' }]}>
                <Text style={styles.streakIcon}>🔥</Text>
              </View>
              <View>
                <Text style={[styles.streakValue, { color: textColor }]}>
                  {streak.count} {labels.days}
                </Text>
                <Text style={[styles.streakSubtitle, { color: textColor + '88' }]}>
                  {labels.currentStreak} • {labels.longestStreak}: {streak.longestStreak || streak.count} {labels.days}
                </Text>
              </View>
            </View>
            <View style={[styles.streakTag, { backgroundColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.15)', borderColor: '#d4af37' }]}>
              <Text style={[styles.streakTagText, { color: '#e5a93c' }]}>
                {streak.count > 0 ? 'ACTIVE' : 'READY'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* 2. Overall Bible Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.progressCardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: textColor }]}>{labels.overallProgress}</Text>
              <Text style={[styles.cardSubtitle, { color: textColor + '88' }]}>{labels.canonical81}</Text>
            </View>
            <Text style={[styles.bigPercentText, { color: '#e5a93c' }]}>{overallProgressPct}%</Text>
          </View>

          {/* Master Progress Bar */}
          <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)' }]}>
            <LinearGradient
              colors={['#e5a93c', '#d4af37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${Math.max(1, parseFloat(overallProgressPct))}%` }]}
            />
          </View>

          <View style={styles.progressDetailRow}>
            <Text style={[styles.progressDetailText, { color: textColor + 'aa' }]}>
              {chaptersReadCount} / {totalCanonicalChapters} {labels.chaptersRead}
            </Text>
            <Text style={[styles.progressDetailText, { color: textColor + 'aa' }]}>
              {completedBooksCount} / 81 {labels.booksCompleted}
            </Text>
          </View>

          {/* Testament Breakdown Bars */}
          <View style={[styles.testamentSection, { borderTopColor: borderColor }]}>
            {/* Old Testament */}
            <View style={styles.testamentRow}>
              <View style={styles.testamentLabelCol}>
                <Text style={[styles.testamentName, { color: textColor }]}>{labels.ot} (46)</Text>
                <Text style={[styles.testamentCount, { color: textColor + '88' }]}>
                  {otChaptersRead}/{otTotalChapters} ({otProgressPct}%)
                </Text>
              </View>
              <View style={[styles.testamentTrack, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)' }]}>
                <View
                  style={[
                    styles.testamentFill,
                    { width: `${Math.max(0, parseFloat(otProgressPct))}%`, backgroundColor: '#e5a93c' },
                  ]}
                />
              </View>
            </View>

            {/* New Testament */}
            <View style={styles.testamentRow}>
              <View style={styles.testamentLabelCol}>
                <Text style={[styles.testamentName, { color: textColor }]}>{labels.nt} (35)</Text>
                <Text style={[styles.testamentCount, { color: textColor + '88' }]}>
                  {ntChaptersRead}/{ntTotalChapters} ({ntProgressPct}%)
                </Text>
              </View>
              <View style={[styles.testamentTrack, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)' }]}>
                <View
                  style={[
                    styles.testamentFill,
                    { width: `${Math.max(0, parseFloat(ntProgressPct))}%`, backgroundColor: '#10b981' },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* 3. Weekly Reading Activity Chart (Real 7-Day Tracker) */}
        <View style={[styles.activityCard, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.activityHeaderRow}>
            <View>
              <Text style={[styles.cardTitle, { color: textColor }]}>{labels.weeklyActivity}</Text>
              <Text style={[styles.cardSubtitle, { color: textColor + '88' }]}>{labels.activeDaysSummary}</Text>
            </View>
            <View style={[styles.flameBadge, { backgroundColor: activeDaysThisWeek > 0 ? 'rgba(229, 169, 60, 0.15)' : 'rgba(15, 23, 42, 0.05)' }]}>
              <Ionicons name="calendar-outline" size={16} color="#e5a93c" />
            </View>
          </View>

          {/* 7 Columns Chart */}
          <View style={styles.chartColumnsRow}>
            {last7Days.map((d, idx) => (
              <View
                key={idx}
                style={[
                  styles.dayColumn,
                  d.isToday && [styles.todayColumn, { borderColor: '#e5a93c' }],
                ]}
              >
                {/* Indicator Circle */}
                <View
                  style={[
                    styles.dayIndicatorCircle,
                    d.isRead
                      ? { backgroundColor: '#e5a93c' }
                      : { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)' },
                  ]}
                >
                  <Ionicons
                    name={d.isRead ? 'checkmark' : 'remove'}
                    size={12}
                    color={d.isRead ? '#091124' : textColor + '44'}
                  />
                </View>

                {/* Day Bar Indicator */}
                <View style={[styles.dayBarTrack, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)' }]}>
                  <View
                    style={[
                      styles.dayBarFill,
                      d.isRead && { height: '100%', backgroundColor: '#e5a93c' },
                    ]}
                  />
                </View>

                <Text style={[styles.dayNumText, { color: textColor }]}>{d.dayNum}</Text>
                <Text style={[styles.dayLabelText, { color: textColor + (d.isToday ? 'ff' : '88') }, d.isToday && { fontWeight: '800' }]}>
                  {d.dayLabel}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4. Core Metrics Grid */}
        <Text style={[styles.sectionTitle, { color: textColor }]}>{labels.overview}</Text>
        <View style={styles.grid}>
          {/* Chapters Read */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
              <Ionicons name="book" size={20} color="#3b82f6" />
            </View>
            <Text style={[styles.statNum, { color: textColor }]}>{chaptersReadCount}</Text>
            <Text style={[styles.statLabel, { color: textColor + '88' }]}>{labels.chaptersRead}</Text>
          </View>

          {/* Books Completed */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Ionicons name="ribbon" size={20} color="#10b981" />
            </View>
            <Text style={[styles.statNum, { color: textColor }]}>{completedBooksCount} / 81</Text>
            <Text style={[styles.statLabel, { color: textColor + '88' }]}>{labels.booksCompleted}</Text>
          </View>

          {/* Books Explored */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
              <Ionicons name="library" size={20} color="#c69214" />
            </View>
            <Text style={[styles.statNum, { color: textColor }]}>{stats.openedBooks.length} / 81</Text>
            <Text style={[styles.statLabel, { color: textColor + '88' }]}>{labels.booksExplored}</Text>
          </View>

          {/* Verses Read */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
              <Ionicons name="document-text" size={20} color="#eab308" />
            </View>
            <Text style={[styles.statNum, { color: textColor }]}>~{estimatedVersesRead.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: textColor + '88' }]}>{labels.versesRead}</Text>
          </View>

          {/* Reading Time */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
              <Ionicons name="time" size={20} color="#8b5cf6" />
            </View>
            <Text style={[styles.statNum, { color: textColor }]}>{timeFormatted}</Text>
            <Text style={[styles.statLabel, { color: textColor + '88' }]}>{labels.readingTime}</Text>
          </View>

          {/* Bookmarks */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
              <Ionicons name="bookmark" size={20} color="#ef4444" />
            </View>
            <Text style={[styles.statNum, { color: textColor }]}>{bookmarksCount}</Text>
            <Text style={[styles.statLabel, { color: textColor + '88' }]}>{labels.bookmarks}</Text>
          </View>

          {/* Highlights */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="color-palette" size={20} color="#f59e0b" />
            </View>
            <Text style={[styles.statNum, { color: textColor }]}>{highlightsCount}</Text>
            <Text style={[styles.statLabel, { color: textColor + '88' }]}>{labels.highlights}</Text>
          </View>

          {/* Journal Entries */}
          <View style={[styles.statCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={[styles.statIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Ionicons name="journal" size={20} color="#10b981" />
            </View>
            <Text style={[styles.statNum, { color: textColor }]}>{journalCount}</Text>
            <Text style={[styles.statLabel, { color: textColor + '88' }]}>{labels.journal}</Text>
          </View>
        </View>

        {/* 5. Milestones & Achievements Section */}
        <View style={styles.achieveHeaderRow}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>{labels.achievements}</Text>
          <View style={[styles.badgePill, { backgroundColor: '#e5a93c' }]}>
            <Text style={styles.badgePillText}>{labels.unlockedBadge}</Text>
          </View>
        </View>

        <View style={styles.achievementsList}>
          {achievements.map(item => {
            const title = language === 'am' ? item.titleAm : (language === 'both' ? `${item.titleAm} (${item.titleEn})` : item.titleEn);
            const desc = language === 'am' ? item.descAm : item.descEn;
            const progressRatio = item.target > 0 ? Math.min(1, item.current / item.target) : 1;

            return (
              <View
                key={item.id}
                style={[
                  styles.achievementCard,
                  { backgroundColor: surfaceColor, borderColor },
                  item.isUnlocked && { borderColor: 'rgba(212, 175, 55, 0.45)', borderWidth: 1.5 },
                ]}
              >
                <View style={[styles.achieveIconBox, item.isUnlocked ? { backgroundColor: 'rgba(212, 175, 55, 0.15)' } : { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)' }]}>
                  <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.achieveTitleRow}>
                    <Text style={[styles.achieveTitle, { color: textColor }, !item.isUnlocked && { opacity: 0.75 }]}>
                      {title}
                    </Text>
                    {item.isUnlocked && (
                      <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                    )}
                  </View>
                  <Text style={[styles.achieveDesc, { color: textColor + '88' }]}>{desc}</Text>

                  {/* Progress Bar */}
                  <View style={styles.achieveProgressRow}>
                    <View style={[styles.achieveProgressBg, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)' }]}>
                      <View
                        style={[
                          styles.achieveProgressFill,
                          {
                            width: `${progressRatio * 100}%`,
                            backgroundColor: item.isUnlocked ? '#e5a93c' : tintColor,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.achieveRatioText, { color: textColor + '88' }]}>
                      {item.current}/{item.target}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroBanner: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  streakBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  streakIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakIcon: {
    fontSize: 28,
  },
  streakValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  streakSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  streakTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  streakTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Progress Card
  progressCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  progressCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  bigPercentText: {
    fontSize: 26,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  progressDetailText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testamentSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
  },
  testamentRow: {
    gap: 4,
  },
  testamentLabelCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testamentName: {
    fontSize: 13,
    fontWeight: '700',
  },
  testamentCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  testamentTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  testamentFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Weekly Activity Chart Card
  activityCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flameBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartColumnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 12,
  },
  todayColumn: {
    borderWidth: 1,
    backgroundColor: 'rgba(229, 169, 60, 0.08)',
  },
  dayIndicatorCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dayBarTrack: {
    width: 8,
    height: 36,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  dayBarFill: {
    width: '100%',
    height: 0,
    borderRadius: 4,
  },
  dayNumText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayLabelText: {
    fontSize: 10,
    marginTop: 2,
  },

  // Grid
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },

  // Achievements
  achieveHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePillText: {
    color: '#091124',
    fontSize: 11,
    fontWeight: '800',
  },
  achievementsList: {
    gap: 12,
    marginBottom: 24,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
  },
  achieveIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achieveTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achieveTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  achieveDesc: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  achieveProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  achieveProgressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  achieveProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achieveRatioText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
