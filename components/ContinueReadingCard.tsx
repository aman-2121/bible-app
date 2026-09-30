import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { getContinueReading, ContinueReadingData } from '@/lib/storage';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getBookThumbnail } from '@/constants/bookImages';

export default function ContinueReadingCard() {
  const [data, setData] = useState<ContinueReadingData | null>(null);
  const { language, theme } = useBible();
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const isDark = theme === 'dark';

  const loadData = async () => {
    const last = await getContinueReading();
    setData(last);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const onContinue = () => {
    if (data) {
      router.push(`/read/${data.bookId}/${data.chapterId}`);
    } else {
      router.push('/read/1/1'); // Default to Genesis 1
    }
  };

  const bookTitle = data
    ? (language === 'am' ? data.bookName : (language === 'both' ? `${data.bookName} (${data.bookNameEn})` : data.bookNameEn))
    : (language === 'am' ? 'ኦሪት ዘፍጥረት' : 'Genesis');

  const chapterNum = data ? data.chapterId : '1';
  const progressPercent = data ? Math.max(5, Math.min(100, Math.round(data.progressPercent))) : 15;
  const bookThumb = getBookThumbnail(data?.bookId || '1');

  const labels = {
    header: language === 'am' ? 'የንባብ ጉዞዎን ይቀጥሉ' : 'Continue Reading',
    chapterLabel: language === 'am' ? `ምዕራፍ ${chapterNum}` : `Chapter ${chapterNum}`,
    completed: language === 'am' ? `${progressPercent}% ተጠናቋል` : `${progressPercent}% complete`,
    btnText: language === 'am' ? 'ንባብ ቀጥል' : 'Continue Reading',
  };

  return (
    <View style={styles.outerWrapper}>
      <View style={styles.sectionHeader}>
        <Ionicons name="book" size={19} color="#e5a93c" />
        <Text style={[styles.sectionHeaderText, { color: textColor }]}>
          {labels.header}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: surfaceColor,
            borderColor: isDark ? 'rgba(212, 175, 55, 0.22)' : 'rgba(212, 175, 55, 0.35)',
            shadowColor: isDark ? '#000' : '#0a1128',
            shadowOpacity: isDark ? 0.12 : 0.08,
          },
        ]}
        onPress={onContinue}
        activeOpacity={0.88}
      >
        <View style={styles.mainRow}>
          {/* Holy Bible Artwork Thumbnail */}
          <View style={styles.thumbWrapper}>
            <Image source={bookThumb} style={styles.bookThumb} resizeMode="cover" />
            <View style={styles.crossOverlay}>
              <Text style={styles.crossIcon}>✝️</Text>
            </View>
          </View>

          {/* Book Name & Progress Details */}
          <View style={styles.infoCol}>
            <Text style={[styles.bookTitle, { color: textColor }]} numberOfLines={1}>
              {bookTitle}
            </Text>
            <Text style={[styles.chapterProgress, { color: textColor + '99' }]}>
              {labels.chapterLabel} • <Text style={{ color: '#e5a93c', fontWeight: '700' }}>{labels.completed}</Text>
            </Text>

            {/* Glowing Golden Progress Bar */}
            <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)' }]}>
              <LinearGradient
                colors={['#c69214', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
          </View>

          {/* Golden Action Button */}
          <LinearGradient
            colors={['#e5a93c', '#d4af37']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueBtn}
          >
            <Text style={styles.continueBtnText}>{labels.btnText}</Text>
            <Ionicons name="arrow-forward" size={15} color="#080f21" />
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  container: {
    borderRadius: 20,
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.22)',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbWrapper: {
    position: 'relative',
    width: 62,
    height: 62,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  bookThumb: {
    width: '100%',
    height: '100%',
  },
  crossOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 14, 30, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossIcon: {
    fontSize: 18,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  chapterProgress: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    elevation: 2,
    shadowColor: '#e5a93c',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  continueBtnText: {
    color: '#080f21',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
