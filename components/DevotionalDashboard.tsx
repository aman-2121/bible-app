import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import { READING_PLANS, ReadingPlanDef } from '@/app/(tabs)/plans';
import { getDailyVerse } from '@/lib/bibleLoader';
import {
  getStreak,
  getReadingStats,
  getBookmarks,
  getHighlights,
  getJournalEntries,
  getPlanProgress,
  StreakData,
  ReadingStats,
  JournalEntry,
} from '@/lib/storage';

export default function DevotionalDashboard() {
  const { language, theme } = useBible();
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const isDark = theme === 'dark';

  const [streak, setStreak] = useState<StreakData>({ count: 0, lastReadDate: null, longestStreak: 0, history: [] });
  const [stats, setStats] = useState<ReadingStats>({ chaptersRead: [], openedBooks: [], totalReadingMinutes: 0 });
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [highlightsCount, setHighlightsCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [recentJournal, setRecentJournal] = useState<JournalEntry | null>(null);
  const [activePlan, setActivePlan] = useState<{
    def: ReadingPlanDef;
    completedDays: number[];
  } | null>(null);

  const loadData = async () => {
    try {
      const [st, s, bm, hl, jn, pr, dv] = await Promise.all([
        getStreak(),
        getReadingStats(),
        getBookmarks(),
        getHighlights(),
        getJournalEntries(),
        getPlanProgress(),
        getDailyVerse(),
      ]);

      setStreak(st);
      setStats(s);
      setBookmarksCount(bm.length);
      setHighlightsCount(hl.length);
      setJournalCount(jn.length);
      setDailyVerse(dv);

      if (jn && jn.length > 0) {
        setRecentJournal(jn[0]);
      } else {
        setRecentJournal(null);
      }

      // Determine active reading plan from real progress
      let foundActive: { def: ReadingPlanDef; completedDays: number[] } | null = null;
      let latestTime = 0;

      for (const plan of READING_PLANS) {
        const planData = pr[plan.id];
        if (planData && (planData.completedDays?.length > 0 || planData.startedDate)) {
          const time = planData.lastActiveDate ? new Date(planData.lastActiveDate).getTime() : 0;
          if (time >= latestTime) {
            latestTime = time;
            foundActive = { def: plan, completedDays: planData.completedDays || [] };
          }
        }
      }
      setActivePlan(foundActive);
    } catch (e) {
      console.log('Error loading dashboard data', e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  // Real stats calculation
  const totalChapters = BIBLE_BOOKS.reduce((sum, b) => sum + (b.chapters || 1), 0);
  const overallProgressPercent = totalChapters > 0
    ? Math.round((stats.chaptersRead.length / totalChapters) * 100)
    : 0;

  const completedBooksCount = BIBLE_BOOKS.filter(b => {
    if (!b.chapters) return false;
    for (let c = 1; c <= b.chapters; c++) {
      if (!stats.chaptersRead.includes(`${b.id}:${c}`)) return false;
    }
    return true;
  }).length;

  const totalMinutes = stats.totalReadingMinutes || 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeFormatted = totalMinutes > 0 ? (hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`) : '0m';

  // Last 7 rolling days for truthful streak indicator
  const streakHistory = streak.history || [];
  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayNamesAm = ['እሁድ', 'ሰኞ', 'ማክሰ', 'ረቡዕ', 'ሐሙስ', 'አርብ', 'ቅዳሜ'];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = d.getDay();
    const isToday = i === 6;
    const isRead = streakHistory.includes(dateStr);
    return {
      dateStr,
      label: language === 'am' ? dayNamesAm[dayOfWeek] : dayNamesEn[dayOfWeek],
      dayNum: d.getDate(),
      isToday,
      isRead,
    };
  });

  // Reading plan metrics
  const planCompletedCount = activePlan?.completedDays.length || 0;
  const planTotalDays = activePlan?.def.days || 1;
  const planPercent = Math.min(100, Math.round((planCompletedCount / planTotalDays) * 100));
  const planCurrentDay = activePlan
    ? Math.min(activePlan.def.days, planCompletedCount < activePlan.def.days ? (planCompletedCount > 0 ? Math.max(...activePlan.completedDays) + 1 : 1) : activePlan.def.days)
    : 1;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: surfaceColor,
      borderColor,
      shadowColor: isDark ? '#000' : '#0a1128',
      shadowOpacity: isDark ? 0.08 : 0.05,
    },
  ];

  return (
    <View style={styles.container}>
      {/* 1. STREAK CARD (REAL DYNAMIC DATA) */}
      <TouchableOpacity
        style={cardStyle}
        onPress={() => router.push('/stats')}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.streakTitleRow}>
            <Text style={styles.streakFlame}>🔥</Text>
            <View>
              <Text style={[styles.streakTitle, { color: textColor }]}>
                {streak.count} {language === 'am' ? 'ቀናት ጽናት' : 'Day Streak'}
              </Text>
              <Text style={[styles.streakSubtitle, { color: textColor + '88' }]}>
                {streak.count === 0
                  ? (language === 'am' ? 'ጽናትዎን ለመጀመር ዛሬ ማንበብ ይጀምሩ!' : 'Read today to start your streak!')
                  : (language === 'am' ? 'በርቱ! ድንቅ ጉዞ ላይ ነዎት!' : "Keep going! You're doing great!")}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={14} color={textColor + '66'} />
        </View>

        {/* 7 Truthful Streak Day Circles */}
        <View style={styles.streakDaysRow}>
          {streakDays.map(item => (
            <View key={item.dateStr} style={styles.dayCol}>
              <View
                style={[
                  styles.dayCircle,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.05)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                  },
                  item.isRead && styles.activeDayCircle,
                  item.isToday && !item.isRead && styles.todayPendingCircle,
                ]}
              >
                {item.isRead ? (
                  <Ionicons name="checkmark" size={10} color="#080f21" />
                ) : (
                  <Text
                    style={[
                      styles.dayCircleText,
                      { color: item.isToday ? '#e5a93c' : textColor + '66' },
                    ]}
                  >
                    {item.dayNum}
                  </Text>
                )}
              </View>
              <Text style={[styles.dayNum, { color: item.isToday ? '#e5a93c' : textColor + '66' }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>

      {/* 2. DAILY MANNA BANNER (REAL SCRIPTURE DATA) */}
      <TouchableOpacity
        style={[
          styles.card,
          styles.dailyMannaCard,
          {
            borderColor: isDark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(212, 175, 55, 0.35)',
            shadowColor: isDark ? '#000' : '#0a1128',
            shadowOpacity: isDark ? 0.08 : 0.05,
          },
        ]}
        onPress={() => router.push('/daily')}
        activeOpacity={0.88}
      >
        <Image
          source={require('@/assets/images/hero2.jpg')}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? 'rgba(7, 14, 30, 0.72)' : 'rgba(10, 20, 45, 0.78)' }]} />

        <View style={styles.mannaContent}>
          <View style={styles.mannaTopRow}>
            <View style={styles.mannaLeft}>
              <View style={styles.sunIconWrapper}>
                <Ionicons name="sunny" size={13} color="#e5a93c" />
              </View>
              <View>
                <Text style={styles.mannaTitle}>
                  {language === 'am' ? 'ዕለታዊ መና' : 'Daily Manna'}
                </Text>
                {dailyVerse && (
                  <Text style={styles.mannaRef}>
                    {language === 'am'
                      ? `${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`
                      : `${dailyVerse.bookNameEn || dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`}
                  </Text>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={15} color="#ffffffaa" />
          </View>

          {/* Actual Verse Text Snippet */}
          {dailyVerse && (
            <Text style={styles.mannaVerseText} numberOfLines={2}>
              {language === 'en' && dailyVerse.textEn ? `“${dailyVerse.textEn}”` : `“${dailyVerse.textAm}”`}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* 3. MY PROGRESS CARD (CALCULATED FROM ACTUAL USER DATA) */}
      <TouchableOpacity
        style={cardStyle}
        onPress={() => router.push('/stats')}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.headingWithIcon}>
            <Ionicons name="bar-chart" size={15} color="#e5a93c" />
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {language === 'am' ? 'የንባብ እድገቴ' : 'My Progress'}
            </Text>
          </View>
          <View style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>
              {language === 'am' ? 'ዝርዝር እይ' : 'View Details'}
            </Text>
            <Ionicons name="chevron-forward" size={12} color="#3b82f6" />
          </View>
        </View>

        {/* 6 Real Grid Metrics */}
        <View style={styles.metricsGrid}>
          {/* Streak */}
          <View style={[styles.metricTile, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.07)',
          }]}>
            <Text style={styles.metricIcon}>🔥</Text>
            <Text style={[styles.metricValue, { color: textColor }]}>{streak.count}</Text>
            <Text style={[styles.metricLabel, { color: textColor + '77' }]}>
              {language === 'am' ? 'ጽናት' : 'Streak'}
            </Text>
          </View>

          {/* Chapters Read */}
          <View style={[styles.metricTile, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.07)',
          }]}>
            <View style={[styles.miniIconBg, { backgroundColor: '#2563eb' }]}>
              <Ionicons name="book" size={10} color="#fff" />
            </View>
            <Text style={[styles.metricValue, { color: textColor }]}>
              {stats.chaptersRead.length}
            </Text>
            <Text style={[styles.metricLabel, { color: textColor + '77' }]}>
              {language === 'am' ? 'ምዕራፎች' : 'Chapters Read'}
            </Text>
          </View>

          {/* Books Completed */}
          <View style={[styles.metricTile, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.07)',
          }]}>
            <View style={[styles.miniIconBg, { backgroundColor: '#059669' }]}>
              <Ionicons name="library" size={10} color="#fff" />
            </View>
            <Text style={[styles.metricValue, { color: textColor }]}>
              {completedBooksCount} / 81
            </Text>
            <Text style={[styles.metricLabel, { color: textColor + '77' }]}>
              {language === 'am' ? 'የተጠናቀቁ' : 'Books Done'}
            </Text>
          </View>

          {/* Bookmarks */}
          <View style={[styles.metricTile, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.07)',
          }]}>
            <View style={[styles.miniIconBg, { backgroundColor: '#8b5cf6' }]}>
              <Ionicons name="bookmark" size={10} color="#fff" />
            </View>
            <Text style={[styles.metricValue, { color: textColor }]}>{bookmarksCount}</Text>
            <Text style={[styles.metricLabel, { color: textColor + '77' }]}>
              {language === 'am' ? 'ተወዳጆች' : 'Bookmarks'}
            </Text>
          </View>

          {/* Highlights */}
          <View style={[styles.metricTile, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.07)',
          }]}>
            <View style={[styles.miniIconBg, { backgroundColor: '#ea580c' }]}>
              <Ionicons name="color-palette" size={10} color="#fff" />
            </View>
            <Text style={[styles.metricValue, { color: textColor }]}>{highlightsCount}</Text>
            <Text style={[styles.metricLabel, { color: textColor + '77' }]}>
              {language === 'am' ? 'የተቀለሙ' : 'Highlights'}
            </Text>
          </View>

          {/* Journal Entries */}
          <View style={[styles.metricTile, {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.07)',
          }]}>
            <View style={[styles.miniIconBg, { backgroundColor: '#0d9488' }]}>
              <Ionicons name="pencil" size={10} color="#fff" />
            </View>
            <Text style={[styles.metricValue, { color: textColor }]}>{journalCount}</Text>
            <Text style={[styles.metricLabel, { color: textColor + '77' }]}>
              {language === 'am' ? 'ማስታወሻ' : 'Journal'}
            </Text>
          </View>
        </View>

        {/* Real Reading Time & Calculated Progress Ring */}
        <View style={[styles.timeAndRingRow, { borderTopColor: borderColor }]}>
          <View style={styles.readingTimeCol}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="time-outline" size={14} color="#e5a93c" />
              <Text style={[styles.timeValue, { color: textColor }]}>{timeFormatted}</Text>
            </View>
            <Text style={[styles.metricLabel, { color: textColor + '77' }]}>
              {language === 'am' ? 'የንባብ ጊዜ' : 'Reading Time'}
            </Text>
          </View>

          <View style={styles.ringWrapper}>
            <View style={styles.donutCircle}>
              <Text style={styles.donutPercent}>{overallProgressPercent}%</Text>
            </View>
            <Text style={[styles.metricLabel, { color: textColor + '77', textAlign: 'center' }]}>
              {language === 'am' ? 'ጠቅላላ እድገት' : 'Overall Progress'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 4. READING PLAN CARD (REAL ACTIVE PLAN OR HONEST EMPTY STATE) */}
      <TouchableOpacity
        style={cardStyle}
        onPress={() => router.push('/plans')}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.headingWithIcon}>
            <Ionicons name="calendar" size={15} color="#e5a93c" />
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {language === 'am' ? 'የንባብ ዕቅድ' : 'Reading Plan'}
            </Text>
          </View>
          <Text style={styles.viewDetailsText}>
            {language === 'am' ? 'ሁሉንም እይ >' : 'View All >'}
          </Text>
        </View>

        {activePlan ? (
          <View style={styles.planCardRow}>
            <Image
              source={require('@/assets/images/hero3.jpg')}
              style={styles.planThumb}
              resizeMode="cover"
            />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.planTitle, { color: textColor }]} numberOfLines={1}>
                {language === 'am' ? activePlan.def.titleAm : activePlan.def.titleEn}
              </Text>
              <Text style={[styles.planSub, { color: textColor + '88' }]}>
                {language === 'am'
                  ? `ቀን ${planCurrentDay} ከ ${activePlan.def.days} • ${planPercent}%`
                  : `Day ${planCurrentDay} of ${activePlan.def.days} • ${planPercent}%`}
              </Text>
              <Text style={[styles.planAssignedText, { color: '#e5a93c' }]}>
                {language === 'am'
                  ? `${activePlan.def.targetBookName} ምዕ ${planCurrentDay}`
                  : `${activePlan.def.targetBookNameEn} Chapter ${planCurrentDay}`}
              </Text>

              <View style={[styles.planProgressBg, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)' }]}>
                <View style={[styles.planProgressFill, { width: `${planPercent}%` }]} />
              </View>

              <TouchableOpacity
                onPress={() => router.push(`/read/${activePlan.def.targetBookId}/${planCurrentDay}`)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#e5a93c', '#d4af37']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.planBtn}
                >
                  <Text style={styles.planBtnText}>
                    {language === 'am' ? 'ቀጥል' : 'Continue Reading'} →
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noPlanBox}>
            <View style={styles.noPlanIconCircle}>
              <Ionicons name="calendar-outline" size={20} color="#e5a93c" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.noPlanTitle, { color: textColor }]}>
                {language === 'am' ? 'ምንም ንቁ የንባብ ዕቅድ የለም' : 'No active reading plan'}
              </Text>
              <Text style={[styles.noPlanSub, { color: textColor + '77' }]}>
                {language === 'am' ? 'የዕለት ተዕለት ንባብዎን ለመጀመር ዕቅድ ይምረጡ' : 'Choose a plan to build your daily reading habit'}
              </Text>
            </View>
            <LinearGradient
              colors={['#e5a93c', '#d4af37']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.choosePlanBtn}
            >
              <Text style={styles.choosePlanBtnText}>
                {language === 'am' ? 'ዕቅድ ምረጥ' : 'Choose Plan'}
              </Text>
            </LinearGradient>
          </View>
        )}
      </TouchableOpacity>

      {/* 5. PRAYER JOURNAL CARD (REAL USER JOURNAL ENTRIES) */}
      <TouchableOpacity
        style={cardStyle}
        onPress={() => router.push('/journal')}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.headingWithIcon}>
            <Ionicons name="journal" size={15} color="#e5a93c" />
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {language === 'am' ? 'የጸሎት ማስታወሻ' : 'Prayer Journal'}
            </Text>
          </View>
          <Text style={styles.viewDetailsText}>
            {language === 'am' ? 'ሁሉንም እይ >' : 'View All >'}
          </Text>
        </View>

        {recentJournal ? (
          <View style={styles.journalRow}>
            <Image
              source={require('@/assets/images/hero4.jpg')}
              style={styles.journalThumb}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <View style={styles.journalMetaRow}>
                <Text style={[styles.journalDate, { color: textColor + '77' }]}>
                  {recentJournal.date || 'Today'}
                </Text>
                <View style={styles.prayerBadge}>
                  <Text style={styles.prayerBadgeText}>
                    {recentJournal.category ? recentJournal.category.toUpperCase() : 'PRAYER'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.journalTitle, { color: textColor }]} numberOfLines={1}>
                {recentJournal.title}
              </Text>
              <Text style={[styles.journalSnippet, { color: textColor + '77' }]} numberOfLines={1}>
                {recentJournal.text}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.noPlanBox}>
            <View style={[styles.noPlanIconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="create-outline" size={20} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.noPlanTitle, { color: textColor }]}>
                {language === 'am' ? 'ምንም የጸሎት ማስታወሻ የለም' : 'No journal entries yet'}
              </Text>
              <Text style={[styles.noPlanSub, { color: textColor + '77' }]}>
                {language === 'am' ? 'የመጀመሪያ የጸሎት ማስታወሻዎን ዛሬ ይጻፉ' : 'Write your first reflection or prayer note'}
              </Text>
            </View>
            <View style={[styles.choosePlanBtn, { backgroundColor: '#10b981' }]}>
              <Text style={[styles.choosePlanBtnText, { color: '#fff' }]}>
                {language === 'am' ? '+ ጻፍ' : '+ Write'}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  card: {
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  streakTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakFlame: {
    fontSize: 16,
  },
  streakTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  streakSubtitle: {
    fontSize: 10,
    marginTop: 1,
  },
  streakDaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  dayCol: {
    alignItems: 'center',
    gap: 3,
  },
  dayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeDayCircle: {
    backgroundColor: '#e5a93c',
    borderColor: '#e5a93c',
  },
  todayPendingCircle: {
    borderColor: '#e5a93c',
    borderWidth: 1.5,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
  },
  dayCircleText: {
    fontSize: 9,
    fontWeight: '700',
  },
  dayNum: {
    fontSize: 9,
    fontWeight: '600',
  },
  dailyMannaCard: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 64,
    padding: 10,
    justifyContent: 'center',
  },
  mannaContent: {
    gap: 6,
  },
  mannaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mannaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sunIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(229, 169, 60, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mannaTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  mannaRef: {
    color: '#e5a93c',
    fontSize: 10,
    fontWeight: '700',
  },
  mannaVerseText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  headingWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 8,
  },
  metricTile: {
    width: '31.5%',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  miniIconBg: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricIcon: {
    fontSize: 12,
    marginBottom: 1,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 8.5,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },
  timeAndRingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  readingTimeCol: {
    alignItems: 'center',
    gap: 1,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  ringWrapper: {
    alignItems: 'center',
    gap: 2,
  },
  donutCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#e5a93c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPercent: {
    color: '#e5a93c',
    fontSize: 9,
    fontWeight: '900',
  },
  planCardRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  planThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  planTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  planSub: {
    fontSize: 10,
  },
  planAssignedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  planProgressBg: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginVertical: 2,
  },
  planProgressFill: {
    height: '100%',
    backgroundColor: '#e5a93c',
  },
  planBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  planBtnText: {
    color: '#080f21',
    fontSize: 9.5,
    fontWeight: '800',
  },
  noPlanBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  noPlanIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noPlanTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  noPlanSub: {
    fontSize: 10,
    marginTop: 1,
  },
  choosePlanBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  choosePlanBtnText: {
    color: '#080f21',
    fontSize: 10,
    fontWeight: '800',
  },
  journalRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  journalThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  journalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  journalDate: {
    fontSize: 9.5,
  },
  prayerBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  prayerBadgeText: {
    color: '#10b981',
    fontSize: 8.5,
    fontWeight: '700',
  },
  journalTitle: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  journalSnippet: {
    fontSize: 10,
    marginTop: 1,
  },
});
