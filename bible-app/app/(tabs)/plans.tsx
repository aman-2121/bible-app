import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useBible();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const plans = [
    { 
      id: '1', 
      title: language === 'am' ? '30 ቀናት በመዝሙረ ዳዊት' : '30 Days of Psalms', 
      days: 30, 
      completed: 5, 
      description: language === 'am' ? 'ሰላምን እና መጽናናትን ለማግኘት በመዝሙረ ዳዊት ውስጥ ዕለታዊ ጉዞ።' : 'A daily journey through the Psalms to bring peace and comfort.' 
    },
    { 
      id: '2', 
      title: language === 'am' ? 'አዲስ ኪዳን በ90 ቀናት' : 'New Testament in 90 Days', 
      days: 90, 
      completed: 0, 
      description: language === 'am' ? 'ሙሉውን አዲስ ኪዳን በሶስት ወር ውስጥ ያንብቡ።' : 'Read through the entire New Testament in just three months.' 
    },
    { 
      id: '3', 
      title: language === 'am' ? 'ምሳሌ ለጥበብ' : 'Proverbs for Wisdom', 
      days: 31, 
      completed: 31, 
      description: language === 'am' ? 'ለአንድ ወር ጥበብ በየቀኑ አንድ ምዕራፍ ምሳሌን ያንብቡ።' : 'One chapter of Proverbs each day for a month of wisdom.' 
    },
  ];

  const labels = {
    title: language === 'am' ? 'የንባብ እቅዶች' : (language === 'both' ? 'የንባብ እቅዶች / Reading Plans' : 'Reading Plans'),
    subtitle: language === 'am' ? 'ዕለታዊ ልምድዎን ያሳድጉ' : 'Grow your daily habit',
    daysCount: (completed: number, total: number) => 
      language === 'am' ? `${total} ቀናት (ያለቀው ${completed})` : `${completed} of ${total} days`,
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
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{labels.title}</Text>
        <Text style={[styles.subtitle, { color: textColor + '88' }]}>{labels.subtitle}</Text>
      </View>

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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'NotoSansEthiopic-Regular',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'NotoSansEthiopic-Regular',
    opacity: 0.7,
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
    fontFamily: 'NotoSansEthiopic-Regular',
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
    fontFamily: 'NotoSansEthiopic-Regular',
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

