import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import AppScreenLayout from '@/components/AppScreenLayout';
import { getPlanProgress, togglePlanDay, PlanProgressMap } from '@/lib/storage';

export interface ReadingPlanDef {
  id: string;
  titleAm: string;
  titleEn: string;
  descAm: string;
  descEn: string;
  days: number;
  icon: string;
  targetBookId: string;
  targetBookName: string;
  targetBookNameEn: string;
}

export const READING_PLANS: ReadingPlanDef[] = [
  {
    id: 'plan_year',
    titleAm: 'መጽሐፍ ቅዱስ በአንድ ዓመት',
    titleEn: 'Bible in 1 Year',
    descAm: 'ሙሉውን 81 መጽሐፍ ቅዱስ በ365 ቀናት ውስጥ በሥርዓት አንብበው ይጨርሱ።',
    descEn: 'Complete the entire Bible canon in 365 organized daily portions.',
    days: 365,
    icon: 'calendar',
    targetBookId: '1',
    targetBookName: 'ኦሪት ዘፍጥረት',
    targetBookNameEn: 'Genesis',
  },
  {
    id: 'plan_six_months',
    titleAm: 'መጽሐፍ ቅዱስ በ6 ወራት',
    titleEn: 'Bible in 6 Months',
    descAm: 'የተፋጠነ የ6 ወር ንባብ መርሃግብር መንፈሳዊ ጥንካሬን ለማጎልበት።',
    descEn: 'An intensive half-year journey through the scriptures.',
    days: 180,
    icon: 'hourglass',
    targetBookId: '1',
    targetBookName: 'ኦሪት ዘፍጥረት',
    targetBookNameEn: 'Genesis',
  },
  {
    id: 'plan_nt_90',
    titleAm: 'አዲስ ኪዳን በ90 ቀናት',
    titleEn: 'New Testament in 90 Days',
    descAm: 'ሙሉውን አዲስ ኪዳን (ወንጌላትንና መልእክታትን) በሦስት ወራት ያንብቡ።',
    descEn: 'Read through all New Testament books in three inspiring months.',
    days: 90,
    icon: 'book',
    targetBookId: '55',
    targetBookName: 'የማቴዎስ ወንጌል',
    targetBookNameEn: 'Matthew',
  },
  {
    id: 'plan_gospels_30',
    titleAm: 'አራቱ ወንጌላት በ30 ቀናት',
    titleEn: 'The Gospels in 30 Days',
    descAm: 'የጌታችን የኢየሱስ ክርስቶስን ሕይወት፣ ትምህርትና ተአምራት በጥልቀት ያጥኑ።',
    descEn: 'Meditate on the life, ministry, and parables of Christ through Matthew, Mark, Luke, and John.',
    days: 30,
    icon: 'flame',
    targetBookId: '55',
    targetBookName: 'የማቴዎስ ወንጌል',
    targetBookNameEn: 'Matthew',
  },
  {
    id: 'plan_psalms_30',
    titleAm: '30 ቀናት በመዝሙረ ዳዊት',
    titleEn: '30 Days of Psalms',
    descAm: 'ዕለታዊ ሰላም፣ ምስጋናና መጽናናት ለማግኘት በመዝሙረ ዳዊት ውስጥ የሚደረግ ጉዞ።',
    descEn: 'A comforting daily journey of praise and prayer through Psalms.',
    days: 30,
    icon: 'musical-notes',
    targetBookId: '28',
    targetBookName: 'መዝሙረ ዳዊት',
    targetBookNameEn: 'Psalms',
  },
  {
    id: 'plan_proverbs_31',
    titleAm: 'ምሳሌ ለጥበብ (31 ቀናት)',
    titleEn: 'Proverbs for Wisdom (31 Days)',
    descAm: 'ለአንድ ወር ያህል በየቀኑ አንድ ምዕራፍ የመጽሐፈ ምሳሌን ጥበብ ይቀስሙ።',
    descEn: 'Read one chapter of Proverbs each day for a month of spiritual wisdom.',
    days: 31,
    icon: 'bulb',
    targetBookId: '29',
    targetBookName: 'መጽሐፈ ምሳሌ',
    targetBookNameEn: 'Proverbs',
  },
  {
    id: 'plan_beginner_14',
    titleAm: 'የጀማሪ መጽሐፍ ቅዱስ ንባብ (14 ቀናት)',
    titleEn: 'Beginner Bible Plan (14 Days)',
    descAm: 'ለመጽሐፍ ቅዱስ ንባብ አዲስ ለሆኑ ምዕመናን የተዘጋጀ መሠረታዊ የ14 ቀን መርሃግብር።',
    descEn: 'A foundational two-week starting plan highlighting the central teachings.',
    days: 14,
    icon: 'sparkles',
    targetBookId: '58',
    targetBookName: 'የዮሐንስ ወንጌል',
    targetBookNameEn: 'John',
  },
];

export default function PlansScreen() {
  const { width } = useWindowDimensions();
  const isWidescreen = width >= 1024;

  const { language, theme } = useBible();
  const isDark = theme === 'dark';

  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [progressMap, setProgressMap] = useState<PlanProgressMap>({});
  const [activePlan, setActivePlan] = useState<ReadingPlanDef | null>(null);

  const loadProgress = async () => {
    const data = await getPlanProgress();
    setProgressMap(data);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [])
  );

  const handleToggleDay = async (planId: string, day: number) => {
    const updated = await togglePlanDay(planId, day);
    setProgressMap(updated);
  };

  const jumpToReading = (plan: ReadingPlanDef, day: number) => {
    const chapterTarget = Math.max(1, day);
    router.push(`/read/${plan.targetBookId}/${chapterTarget}`);
    setActivePlan(null);
  };

  const completedPlansCount = READING_PLANS.filter(p => {
    const pData = progressMap[p.id]?.completedDays || [];
    return pData.length >= p.days;
  }).length;

  const labels = {
    appSubTitle: language === 'am' ? 'የንባብ ዕቅዶች' : 'Reading Plans',
    badgeText: language === 'am' ? 'የንባብ ዕቅዶች' : 'READING PLANS',
    title: language === 'am' ? 'የንባብ ዕቅዶች' : 'Bible Reading Plans',
    subtitle:
      language === 'am'
        ? 'በሥርዓትና በተከታታይ ቅዱሳት መጻሕፍትን ለማንበብ የሚረዱ መንፈሳዊ መርሃግብሮች።'
        : 'Structured plans to build a consistent daily reading habit through the scriptures.',
    daysCount: (completed: number, total: number) =>
      language === 'am' ? `${total} ቀናት (${completed} ተጠናቋል)` : `${completed} of ${total} days`,
    continueReading: language === 'am' ? 'ንባብ ቀጥል' : 'Continue Reading',
    completedBadge: language === 'am' ? 'ተጠናቋል' : 'Completed',
    dayHeader: (day: number) => (language === 'am' ? `ቀን ${day}` : `Day ${day}`),
    viewSchedule: language === 'am' ? 'መርሃግብር እይ →' : 'View Schedule →',
  };

  const renderPlan = ({ item }: { item: ReadingPlanDef }) => {
    const planData = progressMap[item.id] || { completedDays: [] };
    const completedCount = planData.completedDays.length;
    const progress = Math.min(1, completedCount / item.days);
    const isFinished = completedCount >= item.days;

    const title = language === 'am' ? item.titleAm : (language === 'both' ? `${item.titleAm} (${item.titleEn})` : item.titleEn);
    const desc = language === 'am' ? item.descAm : item.descEn;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: surfaceColor,
            borderColor: isFinished ? '#10b981' : borderColor,
            shadowColor: isDark ? '#000' : '#0a1128',
            shadowOpacity: isDark ? 0.08 : 0.04,
          },
        ]}
        onPress={() => setActivePlan(item)}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.planIconTitle}>
            <View
              style={[
                styles.planIconBg,
                {
                  backgroundColor: isDark ? 'rgba(212, 175, 55, 0.15)' : 'rgba(212, 175, 55, 0.12)',
                  borderColor: isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(212, 175, 55, 0.25)',
                },
              ]}
            >
              <Ionicons name={(item.icon as any) || 'book'} size={20} color="#e5a93c" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
              <Text style={[styles.cardDaysTag, { color: textColor + '88' }]}>
                {labels.daysCount(completedCount, item.days)}
              </Text>
            </View>
          </View>

          {isFinished && (
            <View style={styles.finishedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>
          )}
        </View>

        <Text style={[styles.cardDesc, { color: textColor + 'aa' }]} numberOfLines={2}>
          {desc}
        </Text>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressPercent, { color: isFinished ? '#10b981' : '#e5a93c' }]}>
              {Math.round(progress * 100)}%
            </Text>
            <Text style={styles.viewDetailsText}>
              {labels.viewSchedule}
            </Text>
          </View>

          <View
            style={[
              styles.progressBarBg,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)' },
            ]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.max(progress * 100, 3)}%`,
                  backgroundColor: isFinished ? '#10b981' : '#e5a93c',
                },
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <AppScreenLayout subtitle={labels.appSubTitle}>
      <FlatList
        data={READING_PLANS}
        renderItem={renderPlan}
        keyExtractor={item => item.id}
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
                <Ionicons name="calendar" size={13} color="#e5a93c" />
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
                    {READING_PLANS.length} {language === 'am' ? 'ዕቅዶች' : 'Available Plans'}
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
                    {completedPlansCount} {labels.completedBadge}
                  </Text>
                </View>
              </View>
            </View>
          </>
        }
      />

      {/* Plan Schedule Modal */}
      {activePlan && (
        <Modal
          visible={true}
          animationType="slide"
          transparent
          onRequestClose={() => setActivePlan(null)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalSheet,
                {
                  backgroundColor: surfaceColor,
                  borderWidth: 1,
                  borderColor,
                },
              ]}
            >
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.15)' },
                ]}
              />

              <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, { color: textColor }]}>
                    {language === 'am' ? activePlan.titleAm : activePlan.titleEn}
                  </Text>
                  <Text style={[styles.modalSub, { color: textColor + '88' }]}>
                    {activePlan.days} {language === 'am' ? 'ቀናት' : 'Days'} •{' '}
                    {language === 'am' ? activePlan.targetBookName : activePlan.targetBookNameEn}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setActivePlan(null)}
                  style={[
                    styles.closeModalBtn,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)',
                    },
                  ]}
                >
                  <Ionicons name="close" size={20} color={textColor} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.daysGrid} showsVerticalScrollIndicator={false}>
                {Array.from({ length: activePlan.days }, (_, i) => i + 1).map(day => {
                  const completedDays = progressMap[activePlan.id]?.completedDays || [];
                  const isDone = completedDays.includes(day);

                  return (
                    <View
                      key={day}
                      style={[
                        styles.dayRow,
                        {
                          backgroundColor: isDone
                            ? (isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)')
                            : surfaceColor,
                          borderColor: isDone ? '#10b981' : borderColor,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.dayLeft}
                        onPress={() => handleToggleDay(activePlan.id, day)}
                      >
                        <Ionicons
                          name={isDone ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={isDone ? '#10b981' : textColor + '44'}
                        />
                        <Text style={[styles.dayNum, { color: textColor }, isDone && styles.dayNumDone]}>
                          {labels.dayHeader(day)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => jumpToReading(activePlan, day)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={['#e5a93c', '#d4af37']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.readDayBtn}
                        >
                          <Ionicons name="book-outline" size={14} color="#080f21" />
                          <Text style={styles.readDayBtnText}>
                            {language === 'am' ? 'አንብብ' : 'Read'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
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

  // Plan Card
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
  planIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  planIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cardDaysTag: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  finishedBadge: {
    paddingLeft: 8,
  },
  cardDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressSection: {
    gap: 6,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
  },
  viewDetailsText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Modal Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 25, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysGrid: {
    gap: 8,
    paddingBottom: 20,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  dayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '700',
  },
  dayNumDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  readDayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readDayBtnText: {
    color: '#080f21',
    fontSize: 11.5,
    fontWeight: '800',
  },
});
