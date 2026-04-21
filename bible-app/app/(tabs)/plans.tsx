import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function PlansScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const plans = [
    { id: '1', title: '30 Days of Psalms', days: 30, completed: 5, description: 'A daily journey through the Psalms to bring peace and comfort.' },
    { id: '2', title: 'New Testament in 90 Days', days: 90, completed: 0, description: 'Read through the entire New Testament in just three months.' },
    { id: '3', title: 'Proverbs for Wisdom', days: 31, completed: 31, description: 'One chapter of Proverbs each day for a month of wisdom.' },
  ];

  const renderPlan = ({ item }: { item: any }) => {
    const progress = item.completed / item.days;
    const isFinished = item.completed === item.days;

    return (
      <TouchableOpacity style={[styles.card, { backgroundColor: surfaceColor }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>{item.title}</Text>
          {isFinished && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
        </View>
        
        <Text style={[styles.cardDesc, { color: textColor + '99' }]}>{item.description}</Text>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, { color: textColor }]}>
              {item.completed} of {item.days} days
            </Text>
            <Text style={[styles.progressText, { color: tintColor, fontWeight: '700' }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: 'rgba(128,128,128,0.2)' }]}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: isFinished ? '#10b981' : tintColor }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Reading Plans</Text>
        <Text style={[styles.subtitle, { color: textColor + '88' }]}>Grow your daily habit</Text>
      </View>

      <FlatList
        data={plans}
        renderItem={renderPlan}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
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
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  progressSection: {
    marginTop: 'auto',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  }
});
