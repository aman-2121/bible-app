import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scheduleDailyVerse } from '@/lib/notifications';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useBible } from '@/context/BibleContext';
import { getRandomVerse } from '@/lib/bibleLoader';
import GlobalControls from '@/components/GlobalHeader';
import { ThemedText } from '@/components/themed-text';
import VerseItem from '@/components/VerseItem';

const { width } = Dimensions.get('window');

import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  useEffect(() => {
    fetchDaily();
  }, []);

  const greeting = language === 'am' ? 'የዛሬው መነሳሳት' : "Today's Inspiration";

  const title = language === 'am' ? 'ዕለታዊ መና' : 'Daily Manna';

  const DailyHero = () => (
    <View style={[styles.heroCard, { backgroundColor: tintColor + '11' }]}>
      <Ionicons name="sunny-outline" size={48} color={tintColor + '44'} />
      <Text style={[styles.heroVerse, { color: textColor }]}>
        {(language === 'am' || language === 'both') && dailyVerse?.textAm}
      </Text>
      <Text style={[styles.heroRef, { color: tintColor }]}>
        {dailyVerse?.bookName} {dailyVerse?.chapter}:{dailyVerse?.verse}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.greeting, { color: textColor + '88' }]}>{greeting}</Text>
          <ThemedText style={styles.title} type="title">
            {title}
          </ThemedText>
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
                  <Text style={styles.btnText}>{language === 'am' ? 'ሌላ ጥቅስ' : 'New Verse'}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.secondaryBtn, { backgroundColor: surfaceColor, borderColor: tintColor + '33' }]} 
                  onPress={() => scheduleDailyVerse(dailyVerse?.textAm)} 
                >
                  <Ionicons name="notifications-outline" size={20} color={tintColor} />
                  <Text style={[styles.btnTextSecondary, { color: tintColor }]}>{language === 'am' ? 'ማሳወቂያ' : 'Notify'}</Text>
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
              <Text style={{ color: textColor + '66', textAlign: 'center' }}>Related verses appear here</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'NotoSansEthiopic-Regular',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroCard: {
    borderRadius: 30,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  heroVerse: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 34,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'NotoSansEthiopic-Regular',
  },
  heroRef: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionGroup: {
    gap: 15,
    marginBottom: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
  },
  btnTextSecondary: {
    fontWeight: '600',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  noRelated: {
    paddingTop: 40,
    alignItems: 'center',
  },
});
