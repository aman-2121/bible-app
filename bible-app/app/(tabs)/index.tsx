import React, { useState, useMemo, useEffect } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, Text, ImageBackground, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import BookCard from '@/components/BookCard';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useBible } from '@/context/BibleContext';
import GlobalControls from '@/components/GlobalHeader';
import { getRandomVerse } from '@/lib/bibleLoader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// 16 JPG Background Images for Daily Verse Hero (fixed bundler error)
const heroImages = [
  require('../../assets/images/hero1.jpg'),
  require('../../assets/images/hero2.jpg'),
  require('../../assets/images/hero3.jpg'),
  require('../../assets/images/hero4.jpg'),
  require('../../assets/images/download.jpg'),
  require('../../assets/images/download (1).jpg'),
  require('../../assets/images/download (2).jpg'),
  require('../../assets/images/download (3).jpg'),
  require('../../assets/images/download (4).jpg'),
  require('../../assets/images/download (5).jpg'),
  require('../../assets/images/download (6).jpg'),
  require('../../assets/images/download (7).jpg'),
  require('../../assets/images/download (8).jpg'),
  require('../../assets/images/download (9).jpg'),
  require('../../assets/images/download (10).jpg'),
  require('../../assets/images/download (11).jpg'),
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useBible();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const [selectedTestament, setSelectedTestament] = useState('old');
  const [dailyVerse, setDailyVerse] = useState<any>(null);

  useEffect(() => {
    getRandomVerse().then(setDailyVerse);
  }, []);

  // Randomly pick one image on component mount
  const randomHeroImage = useMemo(() => {
    return heroImages[Math.floor(Math.random() * heroImages.length)];
  }, []);

  const onShare = async () => {
    if (!dailyVerse) return;
    try {
      const verse = language === 'am' ? dailyVerse.textAm : dailyVerse.textEn;
      const ref = language === 'am'
        ? `${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`
        : `${dailyVerse.bookNameEn} ${dailyVerse.chapter}:${dailyVerse.verse}`;

      await Share.share({
        message: `${verse}\n\n- ${ref}\n\nShared via Mezamurit Bible App`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const filteredBooks = BIBLE_BOOKS.filter(b => b.testament === selectedTestament);

  const DailyVerseHero = () => (
    <ImageBackground
      source={randomHeroImage}
      style={styles.heroCard}
      imageStyle={{ borderRadius: 24 }}
      resizeMode="cover"
    >
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 24 }]} />

      <View style={styles.heroHeader}>
        <Text style={styles.heroLabel}>
          {language === 'am' ? 'ዕለታዊ ጥቅስ' : (language === 'both' ? 'ዕለታዊ ጥቅስ (Daily Verse)' : 'DAILY VERSE')}
        </Text>
        <Ionicons name="sparkles" size={20} color="rgba(255,255,255,0.7)" />
      </View>
      <Text numberOfLines={4} style={[styles.verseText, language === 'both' && { fontSize: 16, lineHeight: 22 }]}>
        {dailyVerse ? (
          <>
            {language === 'am' && "“" + dailyVerse.textAm + "”"}
            {language === 'en' && "“" + (dailyVerse.textEn || 'Loading English...') + "”"}
            {language === 'both' && (
              <>
                &quot;{dailyVerse.textAm.substring(0, 80)}...&quot;{"\n"}
                <Text style={{ fontSize: 13, opacity: 0.9, fontStyle: 'italic' }}>
                  &quot;{dailyVerse.textEn?.substring(0, 80) || 'Loading...'}...&quot;
                </Text>
              </>
            )}
          </>
        ) : (
          'Loading Daily Verse...'
        )}
      </Text>
      <View style={styles.heroFooter}>
        <Text style={[styles.verseRef]}>
          {dailyVerse ? (
            language === 'am'
              ? `${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`
              : (language === 'both'
                  ? `${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`
                  : `${dailyVerse.bookNameEn} ${dailyVerse.chapter}:${dailyVerse.verse}`)
          ) : '--'}
        </Text>
        <TouchableOpacity
          style={[styles.shareButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          activeOpacity={0.8}
          onPress={onShare}
        >
          <Text style={[styles.shareText, { color: '#fff' }]}>
            {language === 'am' ? 'አጋራ' : (language === 'both' ? 'አጋራ / Share' : 'Share')}
          </Text>
          <Ionicons name="share-social-outline" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={[styles.greeting, { color: textColor + '88' }]}>
            {language === 'am' ? 'ሰላም ለእናንተ ይሁን' : (language === 'both' ? 'ሰላም / Hello' : 'Good Morning')}
          </Text>
          <ThemedText style={styles.title} type="title">
            {language === 'am' ? 'መዛሙሪት' : (language === 'both' ? 'መዛሙሪት (Mezamurit)' : 'Mezamurit')}
          </ThemedText>
        </View>
        <View style={styles.actionGroup}>
          <GlobalControls />
        </View>
      </View>

      <FlatList
        data={filteredBooks}
        ListHeaderComponent={
          <>
            <DailyVerseHero />
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                {language === 'am' ? 'የመጽሐፍ ቅዱስ መጻሕፍት' : 'Books of the Bible'}
              </Text>
              <View style={[styles.testamentToggle, { backgroundColor: 'rgba(128,128,128,0.1)' }]}>
                <TouchableOpacity
                  onPress={() => setSelectedTestament('old')}
                  style={[styles.toggleBtn, selectedTestament === 'old' && { backgroundColor: tintColor }]}
                >
                  <Text style={[styles.toggleText, selectedTestament === 'old' ? { color: '#fff' } : { color: textColor + '88' }]}>
                    {language === 'am' ? 'ብሉይ' : (language === 'both' ? 'ብሉይ (Old)' : 'Old')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedTestament('new')}
                  style={[styles.toggleBtn, selectedTestament === 'new' && { backgroundColor: tintColor }]}
                >
                  <Text style={[styles.toggleText, selectedTestament === 'new' ? { color: '#fff' } : { color: textColor + '88' }]}>
                    {language === 'am' ? 'ሐዲስ' : (language === 'both' ? 'ሐዲስ (New)' : 'New')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => <BookCard bookId={item.id} />}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(128,128,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langTag: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
  },
  heroCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    height: 200,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: 30,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  verseText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseRef: {
    color: 'rgba(255,255,255,1)',
    fontSize: 14,
    fontWeight: '800',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  shareText: {
    fontSize: 12,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  testamentToggle: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  listContent: {
    paddingBottom: 40,
  },
  columnWrapper: {
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
});
