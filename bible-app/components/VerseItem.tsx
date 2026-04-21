import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform, Text } from 'react-native';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';

import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';

interface VerseItemProps {
  verse: number;
  textAm: string;
  textEn?: string;
  verseRef: string;
  fontSize?: number;
  lineSpacing?: number;
  theme?: 'light' | 'sepia' | 'dark';
}

export default function VerseItem({ 
  verse, 
  textAm, 
  textEn, 
  verseRef, 
  fontSize = 21, 
  lineSpacing = 1.8, 
  theme = 'light' 
}: VerseItemProps) {
  const { theme: globalTheme, language, toggleBookmark, bookmarks } = useBible();
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  
  const isBookmarked = bookmarks?.includes(verseRef);

  const getTextColor = () => {
    if (theme === 'dark' || globalTheme === 'dark') return '#f8fafc';
    if (theme === 'sepia') return '#5b4636';
    return textColor;
  };

  const getSubTextColor = () => {
    if (theme === 'dark' || globalTheme === 'dark') return '#94a3b8';
    if (theme === 'sepia') return '#8c7851';
    return '#64748b';
  };

  const getBarColor = () => {
    if (theme === 'dark' || globalTheme === 'dark') return 'rgba(255,255,255,0.05)';
    if (theme === 'sepia') return 'rgba(91,70,54,0.05)';
    return 'rgba(0,0,0,0.03)';
  };

  const currentFontSize = fontSize;
  const dynamicLineHeight = currentFontSize * lineSpacing;

  const copyToClipboard = async () => {
    const txt = language === 'en' ? (textEn || textAm) : textAm;
    await Clipboard.setStringAsync(txt);
    if (Platform.OS === 'web') {
      console.log('Copied to clipboard');
    } else {
      Alert.alert(
        language === 'am' ? 'ተገልብጧል!' : (language === 'both' ? 'Copied! / ተገልብጧል!' : 'Copied!'), 
        language === 'am' ? 'ጥቅሱ ተገልብጦአል።' : (language === 'both' ? 'Verse copied / ተገልብጧል' : 'Verse copied to clipboard.')
      );
    }
  };

  const speakVerse = () => {
    Speech.stop();
    if (language === 'en' && textEn) {
      Speech.speak(textEn, { language: 'en', rate: 0.9 });
    } else {
      Speech.speak(textAm, { language: 'am', rate: 0.9 });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <TouchableOpacity 
          style={[styles.verseNumCircle, isBookmarked && { backgroundColor: tintColor }]} 
          onPress={() => toggleBookmark(verseRef)}
          activeOpacity={0.7}
        >
          <Text style={[styles.verseNumText, { color: isBookmarked ? '#fff' : (theme === 'dark' ? '#fff' : tintColor) }]}>
            {verse}
          </Text>
        </TouchableOpacity>
        <View style={[styles.connector, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(128,128,128,0.1)' }]} />
      </View>
      
      <View style={styles.contentCol}>
        {language === 'am' && (
          <ThemedText style={[styles.textAm, { color: getTextColor(), fontSize: currentFontSize, lineHeight: dynamicLineHeight }]}>
            {textAm}
          </ThemedText>
        )}

        {language === 'en' && (
          <Text style={[styles.textEn, { color: getTextColor(), fontSize: currentFontSize, lineHeight: dynamicLineHeight, fontStyle: 'normal', marginTop: 0 }]}>
            {textEn || textAm}
          </Text>
        )}

        {language === 'both' && (
          <View>
            <ThemedText style={[styles.textAm, { color: getTextColor(), fontSize: currentFontSize, lineHeight: dynamicLineHeight }]}>
              {textAm}
            </ThemedText>
            <Text style={[styles.textEn, { color: getSubTextColor(), fontSize: currentFontSize * 0.85, lineHeight: dynamicLineHeight * 0.85, fontStyle: 'italic', marginTop: 8 }]}>
              {textEn || '(English translation unavailable)'}
            </Text>
          </View>
        )}

        <View style={styles.actionBar}>
          <TouchableOpacity onPress={speakVerse} style={[styles.actionBtn, { backgroundColor: getBarColor() }]}>
            <Ionicons name="mic-outline" size={16} color={tintColor} />
            <Text style={[styles.actionText, { color: tintColor }]}>
              {language === 'en' ? 'Listen' : (language === 'both' ? 'Listen/ስማ' : 'ስማ')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={copyToClipboard} style={[styles.actionBtn, { backgroundColor: getBarColor() }]}>
            <Ionicons name="copy-outline" size={16} color={tintColor} />
            <Text style={[styles.actionText, { color: tintColor }]}>
              {language === 'en' ? 'Copy' : (language === 'both' ? 'Copy/ቅዳ' : 'ቅዳ')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => toggleBookmark(verseRef)} style={[styles.actionBtn, { backgroundColor: getBarColor() }]}>
            <Ionicons name={isBookmarked ? "bookmark" : "bookmark-outline"} size={16} color={tintColor} />
            <Text style={[styles.actionText, { color: tintColor }]}>
              {language === 'en' ? 'Save' : (language === 'both' ? 'Save/ቀንስ' : 'ቀንስ')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  leftCol: {
    width: 40,
    alignItems: 'center',
  },
  verseNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(128,128,128,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  verseNumText: {
    fontSize: 12,
    fontWeight: '800',
  },
  connector: {
    flex: 1,
    width: 1,
    backgroundColor: 'rgba(128,128,128,0.1)',
    marginVertical: 4,
  },
  contentCol: {
    flex: 1,
    paddingLeft: 4,
    paddingBottom: 10,
  },
  textAm: {
    fontFamily: 'NotoSansEthiopic-Regular',
    fontSize: 21,
    lineHeight: 38,
    fontWeight: '500',
  },
  textEn: {
    fontSize: 15,
    lineHeight: 24,
    marginTop: 8,
    fontFamily: 'Serif', 
  },
  actionBar: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 15,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.05)',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  }
});

