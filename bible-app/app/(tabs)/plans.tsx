import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';
import GlobalControls from '@/components/GlobalHeader';

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useBible();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  // Helper: show Amharic only, English only, or both stacked
  const t = (am: string, en: string) =>
    language === 'am' ? am : language === 'en' ? en : `${am}\n${en}`;

  const plans = [
    { 
      id: '1', 
      title: t('30 ቀናት በመዝሙረ ዳዊት', '30 Days of Psalms'), 
      days: 30, 
      completed: 5, 
      description: t('ሰላምን እና መጽናናትን ለማግኘት በመዝሙረ ዳዊት ውስጥ ዕለታዊ ጉዞ።', 'A daily journey through the Psalms to bring peace and comfort.')
    },
    { 
      id: '2', 
      title: t('አዲስ ኪዳን በ90 ቀናት', 'New Testament in 90 Days'), 
      days: 90, 
      completed: 0, 
      description: t('ሙሉውን አዲስ ኪዳን በሶስት ወር ውስጥ ያንብቡ።', 'Read through the entire New Testament in just three months.')
    },
    { 
      id: '3', 
      title: t('ምሳሌ ለጥበብ', 'Proverbs for Wisdom'), 
      days: 31, 
      completed: 31, 
      description: t('ለአንድ ወር ጥበብ በየቀኑ አንድ ምዕራፍ ምሳሌን ያንብቡ።', 'One chapter of Proverbs each day for a month of wisdom.')
    },
  ];

  const labels = {
    title: t('የንባብ እቅዶች', 'Reading Plans'),
    subtitle: t('ዕለታዊ ልምድዎን ያሳድጉ', 'Grow your daily habit'),
    daysCount: (completed: number, total: number) =>
      t(`${total} ቀናት (ያለቀው ${completed})`, `${completed} of ${total} days`),
  };

  const renderPlan = ({ item }: { item: any }) => {
    const progress = item.completed / item.days;
    const isFinished = item.completed === item.days;

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: surfaceColor, shadowColor: tintColor }]}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>{item.title}</Text>
          {isFinished && (
            <View style={[styles.finishedBadge, { backgroundColor: '#10b98122' }]}>
              <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            </View>
          )}
        </View>
        
        <Text style={[styles.cardDesc, { color: textColor + 'bb' }]}>{item.description}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: textColor + '88' }]}>
              {labels.daysCount(item.completed, item.days)}
            </Text>
            <Text style={[styles.progressPercent, { color: tintColor }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: tintColor + '15' }]}>
            <LinearGradient
              colors={[tintColor, tintColor + '88']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{labels.title}</Text>
            <Text style={styles.subtitle}>{labels.subtitle}</Text>
          </View>
          <GlobalControls />
        </View>
      </LinearGradient>

      <FlatList
        data={plans}
        renderItem={renderPlan}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    color: 'rgba(255,255,255,0.7)',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  card: {
    padding: 25,
    borderRadius: 24,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    lineHeight: 24,
  },
  finishedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 25,
  },
  progressSection: {
    marginTop: 'auto',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '900',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  }
});

