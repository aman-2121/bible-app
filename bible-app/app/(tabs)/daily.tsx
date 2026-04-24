import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scheduleDailyVerse } from '@/lib/notifications';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useBible } from '@/context/BibleContext';
import { getRandomVerse } from '@/lib/bibleLoader';
import GlobalControls from '@/components/GlobalHeader';
import { ThemedText } from '@/components/themed-text';
import VerseItem from '@/components/VerseItem';
import { updateStreak, StreakData } from '@/lib/storage';
import { LinearGradient } from 'expo-linear-gradient';

// const { width } = Dimensions.get('window');

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';


export default function DailyScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useBible();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [relatedVerses, setRelatedVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastReadDate: null });

  const fetchDaily = async () => {
    setLoading(true);
    const verse = await getRandomVerse();
    setDailyVerse(verse);
    const related = [];
    for (let i = 0; i < 3; i++) {
      const rel = await getRandomVerse();
      if (rel.verseRef !== verse.verseRef) related.push(rel);
    }
    setRelatedVerses(related);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      // Update streak every time this screen is focused
      updateStreak().then(setStreak);
    }, [])
  );

  useEffect(() => {
    fetchDaily();
  }, []);

  // Bilingual Labels
  const labels = {
    greeting: language === 'am' ? 'የዛሬው መነሳሳት' : (language === 'both' ? 'የዛሬው መነሳሳት / Today\'s Inspiration' : "Today's Inspiration"),
    title: language === 'am' ? 'ዕለታዊ መና' : (language === 'both' ? 'ዕለታዊ መና / Daily Manna' : 'Daily Manna'),
    newVerse: language === 'am' ? 'ሌላ ጥቅስ' : (language === 'both' ? 'ሌላ ጥቅስ / New Verse' : 'New Verse'),
    notify: language === 'am' ? 'ማሳወቂያ' : (language === 'both' ? 'ማሳወቂያ / Notify' : 'Notify'),
    streakLabel: language === 'am' ? 'ቀናት' : (language === 'both' ? 'ቀናት / Days' : 'Days'),
    emptyRelated: language === 'am' ? 'ተዛማጅ ጥቅሶች እዚህ ይገኛሉ' : 'Related verses appear here'
  };

  const DailyHero = () => (
    <View style={[styles.heroCard, { backgroundColor: tintColor + '11' }]}>
      <Ionicons name="sunny-outline" size={48} color={tintColor + '44'} />
      <Text style={[styles.heroVerse, { color: textColor }]}>
        {(language === 'am' || language === 'both') && dailyVerse?.textAm}
        {language === 'both' && "\n"}
        {(language === 'en' || language === 'both') && dailyVerse?.textEn}
      </Text>
      <Text style={[styles.heroRef, { color: tintColor }]}>
        {language === 'am' ? `${dailyVerse?.bookName} ${dailyVerse?.chapter}:${dailyVerse?.verse}` : `${dailyVerse?.bookNameEn || dailyVerse?.bookName} ${dailyVerse?.chapter}:${dailyVerse?.verse}`}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: textColor + '88' }]}>{labels.greeting}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <ThemedText style={styles.title} type="title">
              {labels.title}
            </ThemedText>
            {streak.count > 0 && (
              <LinearGradient
                colors={['#fbbf24', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.streakBadge}
              >
                <Text style={styles.streakText}>🔥 {streak.count} {labels.streakLabel}</Text>
              </LinearGradient>
            )}
          </View>
        </View>
        <GlobalControls />
      </View>

      <FlatList
        data={relatedVerses}
        ListHeaderComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={tintColor} />
            </View>
          ) : (
            <View style={styles.headerContent}>
              <DailyHero />
              <View style={styles.actionGroup}>
                <TouchableOpacity 
                  style={[styles.primaryBtn, { backgroundColor: tintColor }]} 
                  onPress={fetchDaily}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.btnText}>{labels.newVerse}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.secondaryBtn, { backgroundColor: surfaceColor, borderColor: tintColor + '33' }]} 
                  onPress={() => scheduleDailyVerse(dailyVerse?.textAm)} 
                >
                  <Ionicons name="notifications-outline" size={20} color={tintColor} />
                  <Text style={[styles.btnTextSecondary, { color: tintColor }]}>{labels.notify}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }
        renderItem={({ item }) => <VerseItem {...item} verseRef={item.verseRef} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (
            <View style={styles.noRelated}>
              <Text style={{ color: textColor + '66', textAlign: 'center' }}>{labels.emptyRelated}</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: undefined,
  },
  streakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroCard: {
    borderRadius: 30,
    minHeight: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  heroVerse: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: undefined,
  },
  heroRef: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 100,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
  },
  btnTextSecondary: {
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 40,
  },
  noRelated: {
    paddingTop: 40,
    alignItems: 'center',
  },
});

