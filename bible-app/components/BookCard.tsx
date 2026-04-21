import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import { useBible } from '@/context/BibleContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface BookCardProps {
  bookId: string;
}

export default function BookCard({ bookId }: BookCardProps) {
  const { setCurrentBook, language } = useBible();
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');

  const book = BIBLE_BOOKS.find(b => b.id === bookId);

  const onPress = () => {
    setCurrentBook(bookId);
    router.push(`/book/${bookId}`);
  };

  const displayName = language === 'en' ? book?.nameEn : (language === 'both' ? `${book?.name} (${book?.nameEn})` : book?.name);
  const chapterLbl = language === 'en' ? `${book?.chapters} Chapters` : (language === 'both' ? `${book?.chapters} Chapters / ምዕራፎች` : `${book?.chapters} ምዕራፎች`);

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: surfaceColor, shadowColor: tintColor }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: tintColor + '10' }]}>
        <Ionicons name="book-outline" size={24} color={tintColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.name, { color: textColor }]}>{displayName || 'Unknown'}</Text>
        <View style={styles.footer}>
          <Text style={[styles.chapters, { color: textColor + '88' }]}>{chapterLbl}</Text>
          <Ionicons name="chevron-forward" size={12} color={textColor + '66'} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 16,
    flex: 1,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  textContainer: {
    gap: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'NotoSansEthiopic-Regular',
  },
  nameEn: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  chapters: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

