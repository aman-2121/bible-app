import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scheduleDailyVerse } from '@/lib/notifications';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useBible } from '@/context/BibleContext';
import { getRandomVerse, getDailyVerse } from '@/lib/bibleLoader';
import VerseItem from '@/components/VerseItem';
import { updateStreak, StreakData } from '@/lib/storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { speakBibleText, stopSpeech } from '@/lib/tts';
import { useFocusEffect, router } from 'expo-router';
import AppScreenLayout from '@/components/AppScreenLayout';

export default function DailyScreen() {
  const { language, theme } = useBible();
  const isDark = theme === 'dark';

  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [relatedVerses, setRelatedVerses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastReadDate: null, longestStreak: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Automatically switch audio language or stop when user changes language
  useEffect(() => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    }
  }, [language]);

  const fetchDaily = async () => {
    setLoading(true);
    const verse = await getDailyVerse();
    setDailyVerse(verse);
    const related: any[] = [];
    for (let i = 0; i < 3; i++) {
      const rel = await getRandomVerse();
      if (rel && (!verse || rel.verseRef !== verse.verseRef)) {
        related.push(rel);
      }
    }
    setRelatedVerses(related);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      updateStreak().then(setStreak);
    }, [])
  );

  useEffect(() => {
    fetchDaily();
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

  const speakDailyVerse = async () => {
    if (!dailyVerse) return;
    if (isSpeaking) {
      await stopSpeech();
      setIsSpeaking(false);
      return;
    }

    await speakBibleText({
      textAm: dailyVerse.textAm,
      textEn: dailyVerse.textEn,
      appLang: language,
      onStart: () => setIsSpeaking(true),
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const shareDailyVerse = async () => {
    if (!dailyVerse) return;
    try {
      const verse = language === 'am' ? dailyVerse.textAm : dailyVerse.textEn;
      const ref =
        language === 'am'
          ? `${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`
          : `${dailyVerse.bookNameEn || dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`;

      await Share.share({
        message: `“${verse}”\n\n— ${ref}\n\nዕለታዊ መና (Daily Manna) - የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ 81 መጽሐፍ ቅዱስ`,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const writeReflection = () => {
    if (!dailyVerse) return;
    router.push(`/journal/new?verseRef=${dailyVerse.verseRef}`);
  };

  const jumpToReader = () => {
    if (!dailyVerse) return;
    const parts = (dailyVerse.verseRef || '').split(':');
    if (parts.length >= 2) router.push(`/read/${parts[0]}/${parts[1]}`);
  };

  const labels = {
    appSubTitle: language === 'am' ? 'ዕለታዊ መናና አስተንትኖ' : 'Daily Manna & Meditation',
    greeting: language === 'am' ? 'የዛሬው መንፈሳዊ መነሳሳት' : "Today's Spiritual Inspiration",
    title: language === 'am' ? 'ዕለታዊ መና' : 'Daily Manna',
    newVerse: language === 'am' ? 'ሌላ ጥቅስ ቀይር' : 'New Verse',
    notify: language === 'am' ? 'ማሳወቂያ አዘጋጅ' : 'Set Reminder',
    streakLabel: language === 'am' ? 'ቀናት ጽናት' : 'Day Streak',
    relatedHeader: language === 'am' ? 'ተጨማሪ ዕለታዊ ጥቅሶች' : 'More Verses for Meditation',
    reflectBtn: language === 'am' ? 'አስተንትኖ ጻፍ' : 'Reflect & Journal',
    readChapter: language === 'am' ? 'ሙሉውን ምዕራፍ አንብብ' : 'Read Full Chapter',
  };

  return (
    <AppScreenLayout subtitle={labels.appSubTitle}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e5a93c" />
        </View>
      ) : (
        <FlatList
          data={relatedVerses}
          keyExtractor={item => item.verseRef}
          contentContainerStyle={[styles.listContent, { paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Daily Hero Banner Card */}
              <View
                style={[
                  styles.heroCard,
                  {
                    backgroundColor: surfaceColor,
                    borderColor: isDark ? 'rgba(212, 175, 55, 0.25)' : 'rgba(212, 175, 55, 0.35)',
                    shadowColor: isDark ? '#000' : '#0a1128',
                    shadowOpacity: isDark ? 0.12 : 0.06,
                  },
                ]}
              >
                <View style={styles.heroTopRow}>
                  <View style={styles.heroBadge}>
                    <Ionicons name="sunny" size={13} color="#e5a93c" />
                    <Text style={styles.heroBadgeText}>የዕለቱ ቃል / VERSE OF THE DAY</Text>
                  </View>

                  <TouchableOpacity
                    onPress={speakDailyVerse}
                    style={[
                      styles.heroAudioBtn,
                      {
                        backgroundColor: isSpeaking
                          ? '#e5a93c'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(15, 23, 42, 0.05)',
                        borderColor,
                      },
                    ]}
                  >
                    <Ionicons
                      name={isSpeaking ? 'pause' : 'volume-high'}
                      size={17}
                      color={isSpeaking ? '#091124' : '#e5a93c'}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.heroVerseAm, { color: textColor }]}>
                  “{dailyVerse?.textAm}”
                </Text>

                {language !== 'am' && dailyVerse?.textEn && (
                  <Text style={[styles.heroVerseEn, { color: textColor + '88' }]}>
                    “{dailyVerse.textEn}”
                  </Text>
                )}

                <View style={[styles.heroDivider, { backgroundColor: borderColor }]} />

                <View style={styles.heroFooter}>
                  <Text style={styles.heroRef}>
                    {language === 'am'
                      ? `${dailyVerse?.bookName} ${dailyVerse?.chapter}:${dailyVerse?.verse}`
                      : `${dailyVerse?.bookNameEn || dailyVerse?.bookName} ${dailyVerse?.chapter}:${dailyVerse?.verse}`}
                  </Text>

                  <View style={styles.heroActionRow}>
                    <TouchableOpacity
                      style={styles.heroActionBtn}
                      onPress={jumpToReader}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="book-outline" size={13} color="#080f21" />
                      <Text style={styles.heroActionBtnText}>{labels.readChapter}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.heroShareBtn,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)',
                          borderColor,
                        },
                      ]}
                      onPress={shareDailyVerse}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="share-social-outline" size={15} color="#e5a93c" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Quick Actions Strip */}
              <View style={styles.actionStrip}>
                <TouchableOpacity
                  style={[styles.stripAction, { backgroundColor: surfaceColor, borderColor }]}
                  onPress={fetchDaily}
                  activeOpacity={0.8}
                >
                  <Ionicons name="shuffle" size={18} color="#e5a93c" />
                  <Text style={[styles.stripActionText, { color: textColor }]}>{labels.newVerse}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.stripAction, { backgroundColor: surfaceColor, borderColor }]}
                  onPress={writeReflection}
                  activeOpacity={0.8}
                >
                  <Ionicons name="pencil" size={18} color="#3b82f6" />
                  <Text style={[styles.stripActionText, { color: textColor }]}>{labels.reflectBtn}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.stripAction, { backgroundColor: surfaceColor, borderColor }]}
                  onPress={() => scheduleDailyVerse(dailyVerse?.textAm)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="notifications-outline" size={18} color="#10b981" />
                  <Text style={[styles.stripActionText, { color: textColor }]}>{labels.notify}</Text>
                </TouchableOpacity>
              </View>

              {/* Related Verses Section Header */}
              <View style={styles.relatedSectionHeader}>
                <Ionicons name="sparkles" size={17} color="#e5a93c" />
                <Text style={[styles.relatedTitle, { color: textColor }]}>
                  {labels.relatedHeader}
                </Text>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <VerseItem
              {...item}
              verseRef={item.verseRef}
              onLongPress={() => {
                const parts = item.verseRef.split(':');
                if (parts.length >= 2) router.push(`/read/${parts[0]}/${parts[1]}`);
              }}
            />
          )}
        />
      )}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
  },
  heroBadgeText: {
    color: '#e5a93c',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroAudioBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  heroVerseAm: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 8,
  },
  heroVerseEn: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 12,
  },
  heroDivider: {
    height: 1,
    marginVertical: 10,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroRef: {
    color: '#e5a93c',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#e5a93c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroActionBtnText: {
    color: '#080f21',
    fontSize: 11.5,
    fontWeight: '800',
  },
  heroShareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  stripAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 1,
  },
  stripActionText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  relatedSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  relatedTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
