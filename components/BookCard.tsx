import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import { useBible } from '@/context/BibleContext';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getReadingStats } from '@/lib/storage';
import { getBookThumbnail } from '@/constants/bookImages';

interface BookCardProps {
  bookId: string;
  horizontal?: boolean;
}

export default function BookCard({ bookId, horizontal = false }: BookCardProps) {
  const { setCurrentBook, language, theme } = useBible();
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const isDark = theme === 'dark';

  const [completedChaptersCount, setCompletedChaptersCount] = useState(0);

  const book = BIBLE_BOOKS.find(b => b.id === bookId);

  const loadProgress = async () => {
    const stats = await getReadingStats();
    const count = stats.chaptersRead.filter(k => k.startsWith(`${bookId}:`)).length;
    setCompletedChaptersCount(count);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [bookId])
  );

  const onPress = () => {
    setCurrentBook(bookId);
    router.push(`/book/${bookId}`);
  };

  const primaryName = language === 'en' ? book?.nameEn : book?.name;
  const secondaryName = language === 'en' ? book?.name : book?.nameEn;

  const totalChapters = book?.chapters || 1;
  const progressRatio = totalChapters > 0 ? Math.min(1, completedChaptersCount / totalChapters) : 0;
  const progressPercent = Math.round(progressRatio * 100);

  const chapterLbl =
    language === 'am'
      ? `${totalChapters} ምዕራፎች`
      : `${totalChapters} chapters`;

  const thumbSource = getBookThumbnail(bookId);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: surfaceColor,
          borderColor,
          shadowColor: isDark ? '#000' : '#0a1128',
          shadowOpacity: isDark ? 0.12 : 0.06,
        },
        horizontal && styles.horizontalCard,
      ]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* Artwork Thumbnail with Cross Watermark */}
      <View style={styles.thumbnailWrapper}>
        <Image source={thumbSource} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.thumbOverlay} />
        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" style={styles.cornerChevron} />
      </View>

      {/* Book Metadata */}
      <View style={styles.contentCol}>
        <Text style={[styles.primaryName, { color: textColor }]} numberOfLines={1}>
          {primaryName || 'Unknown'}
        </Text>
        <Text style={[styles.secondaryName, { color: textColor + '88' }]} numberOfLines={1}>
          {secondaryName}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={[styles.chaptersText, { color: textColor + '99' }]}>
            {chapterLbl}
          </Text>
          <Text style={[styles.percentText, { color: progressPercent > 0 ? '#e5a93c' : textColor + '66' }]}>
            {progressPercent}%
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)' }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(progressPercent, 4)}%`,
                backgroundColor: progressRatio === 1 ? '#10b981' : '#e5a93c',
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 10,
    margin: 6,
    flex: 1,
    minWidth: 155,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  horizontalCard: {
    width: 170,
    flex: 0,
    marginRight: 10,
    marginLeft: 0,
  },
  thumbnailWrapper: {
    position: 'relative',
    height: 78,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#070e1e',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 25, 0.35)',
  },
  cornerChevron: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 2,
  },
  contentCol: {
    gap: 2,
  },
  primaryName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  secondaryName: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  chaptersText: {
    fontSize: 11,
    fontWeight: '600',
  },
  percentText: {
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
