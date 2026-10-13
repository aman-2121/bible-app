import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { speakBibleText, stopSpeech } from '@/lib/tts';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/themed-text';
import { isFabricatedEnglish, cleanAmharicVerse } from '@/lib/englishBible';

interface VerseItemProps {
  verse: number;
  textAm: string;
  textEn?: string;
  verseRef: string;
  bookName?: string;
  bookNameEn?: string;
  chapterId?: string;
  fontSize?: number;
  lineSpacing?: number;
  theme?: 'light' | 'sepia' | 'dark';
  highlightColor?: string;
  isSpeaking?: boolean;
  onLongPress?: () => void;
  onOpenActionSheet?: () => void;
}

export default function VerseItem({
  verse,
  textAm,
  textEn,
  verseRef,
  bookName,
  bookNameEn,
  chapterId,
  fontSize = 20,
  lineSpacing = 1.68,
  theme = 'light',
  highlightColor,
  isSpeaking = false,
  onLongPress,
  onOpenActionSheet,
}: VerseItemProps) {
  const { theme: globalTheme, language, toggleBookmark, bookmarks } = useBible();
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const [localSpeaking, setLocalSpeaking] = useState(false);
  const activeSpeaking = isSpeaking || localSpeaking;

  const cleanAm = cleanAmharicVerse(textAm || '');
  const hasValidEn = Boolean(textEn && textEn.trim().length > 0 && !isFabricatedEnglish(textEn));

  // If user switches language while local verse audio is active, re-trigger with new language
  useEffect(() => {
    if (localSpeaking) {
      if (language === 'en' && !hasValidEn) {
        stopSpeech();
        setLocalSpeaking(false);
        return;
      }

      speakBibleText({
        textAm: cleanAm,
        textEn: hasValidEn ? textEn : undefined,
        appLang: language,
        verse,
        onStart: () => setLocalSpeaking(true),
        onDone: () => setLocalSpeaking(false),
        onStopped: () => setLocalSpeaking(false),
        onError: () => setLocalSpeaking(false),
      });
    }
  }, [language]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (localSpeaking) {
        stopSpeech();
      }
    };
  }, [localSpeaking]);

  const isBookmarked = bookmarks?.includes(verseRef);

  const getTextColor = () => {
    if (theme === 'dark' || globalTheme === 'dark') return '#f8fafc';
    if (theme === 'sepia') return '#4a3728';
    return '#091124';
  };

  const getSubTextColor = () => {
    if (theme === 'dark' || globalTheme === 'dark') return '#94a3b8';
    if (theme === 'sepia') return '#786252';
    return '#475569';
  };

  const getBtnBg = () => {
    if (theme === 'dark' || globalTheme === 'dark') return 'rgba(255, 255, 255, 0.05)';
    if (theme === 'sepia') return 'rgba(91, 70, 54, 0.06)';
    return 'rgba(15, 23, 42, 0.04)';
  };

  const getBtnBorder = () => {
    if (theme === 'dark' || globalTheme === 'dark') return 'rgba(212, 175, 55, 0.16)';
    if (theme === 'sepia') return 'rgba(184, 134, 11, 0.18)';
    return 'rgba(15, 23, 42, 0.08)';
  };

  const currentFontSize = fontSize;
  const dynamicLineHeight = Math.round(currentFontSize * lineSpacing);

  const copyToClipboard = async () => {
    let txt = '';
    const bName =
      language === 'am'
        ? (bookName || '')
        : language === 'both'
        ? `${bookName || ''} (${bookNameEn || ''})`
        : (bookNameEn || bookName || '');
    const refSuffix = bName ? `\n— ${bName} ${chapterId ? chapterId + ':' : ''}${verse}` : '';

    if (language === 'am') {
      txt = `“${cleanAm}”${refSuffix}`;
    } else if (language === 'en') {
      if (hasValidEn) {
        txt = `“${textEn}”${refSuffix}`;
      } else {
        txt = `[English translation unavailable for this verse]${refSuffix}`;
      }
    } else {
      // Bilingual mode
      const enSnippet = hasValidEn ? textEn : '[English translation unavailable]';
      txt = `አማርኛ:\n“${cleanAm}”\n\nENGLISH:\n“${enSnippet}”${refSuffix}`;
    }

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

  const speakVerse = async () => {
    if (localSpeaking) {
      await stopSpeech();
      setLocalSpeaking(false);
      return;
    }

    if (language === 'en' && !hasValidEn) {
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Audio Unavailable',
          'English narration is unavailable because the English translation is not available for this verse in this offline edition.'
        );
      }
      return;
    }

    await stopSpeech();
    const success = await speakBibleText({
      textAm: cleanAm,
      textEn: hasValidEn ? textEn : undefined,
      appLang: language,
      verse,
      onStart: () => setLocalSpeaking(true),
      onDone: () => setLocalSpeaking(false),
      onStopped: () => setLocalSpeaking(false),
      onError: () => setLocalSpeaking(false),
    });
    if (!success) {
      setLocalSpeaking(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        activeSpeaking && {
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          borderLeftWidth: 3,
          borderLeftColor: '#c69214',
          borderRadius: 10,
        },
      ]}
    >
      {/* Verse Number Column */}
      <View style={styles.leftCol}>
        <TouchableOpacity
          style={[
            styles.verseNumCircle,
            isBookmarked && { backgroundColor: '#c69214', borderColor: '#e5a93c' },
            activeSpeaking && { borderColor: '#c69214', backgroundColor: 'rgba(212, 175, 55, 0.25)' },
          ]}
          onPress={() => toggleBookmark(verseRef)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={`Verse ${verse}`}
        >
          <Text
            style={[
              styles.verseNumText,
              { color: isBookmarked ? '#fff' : (theme === 'dark' || globalTheme === 'dark' ? '#f8fafc' : tintColor) },
            ]}
          >
            {verse}
          </Text>
        </TouchableOpacity>
        <View
          style={[
            styles.connector,
            { backgroundColor: (theme === 'dark' || globalTheme === 'dark') ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
          ]}
        />
      </View>

      {/* Main Verse Text & Action Buttons */}
      <TouchableOpacity
        style={[
          styles.contentCol,
          highlightColor
            ? { backgroundColor: highlightColor, borderRadius: 8, paddingHorizontal: 6, marginHorizontal: -3 }
            : null,
        ]}
        activeOpacity={0.85}
        onLongPress={onLongPress || onOpenActionSheet}
        delayLongPress={300}
      >
        {/* 1. Amharic Mode */}
        {language === 'am' && (
          <ThemedText
            style={[
              styles.textAm,
              { color: getTextColor(), fontSize: currentFontSize, lineHeight: dynamicLineHeight },
            ]}
          >
            {cleanAm}
          </ThemedText>
        )}

        {/* 2. English Mode */}
        {language === 'en' && (
          hasValidEn ? (
            <Text
              style={[
                styles.textEn,
                { color: getTextColor(), fontSize: currentFontSize, lineHeight: dynamicLineHeight },
              ]}
            >
              {textEn}
            </Text>
          ) : (
            <View style={styles.unavailableBox}>
              <Ionicons name="information-circle-outline" size={15} color="#e5a93c" style={{ marginRight: 6 }} />
              <Text style={[styles.unavailableText, { color: getSubTextColor() }]}>
                English translation unavailable for this verse
              </Text>
            </View>
          )
        )}

        {/* 3. Bilingual Mode (Both languages together, clearly labeled) */}
        {language === 'both' && (
          <View style={styles.bilingualWrapper}>
            {/* Amharic Verse Block */}
            <View style={styles.bilingualBlock}>
              <View style={styles.langBadgeRow}>
                <View
                  style={[
                    styles.langBadgeAm,
                    {
                      backgroundColor: (theme === 'dark' || globalTheme === 'dark')
                        ? 'rgba(212, 175, 55, 0.18)'
                        : 'rgba(212, 175, 55, 0.12)',
                      borderColor: (theme === 'dark' || globalTheme === 'dark')
                        ? 'rgba(212, 175, 55, 0.38)'
                        : 'rgba(212, 175, 55, 0.28)',
                    },
                  ]}
                >
                  <Text style={styles.langBadgeAmText}>አማርኛ</Text>
                </View>
                <Text style={[styles.langBadgeSub, { color: getSubTextColor() }]}>
                  — የመጀመሪያው ጽሑፍ
                </Text>
              </View>
              <ThemedText
                style={[
                  styles.textAm,
                  { color: getTextColor(), fontSize: currentFontSize, lineHeight: dynamicLineHeight },
                ]}
              >
                {cleanAm}
              </ThemedText>
            </View>

            {/* English Verse Block */}
            <View style={[styles.bilingualBlock, styles.bilingualBlockEn]}>
              <View style={styles.langBadgeRow}>
                <View
                  style={[
                    styles.langBadgeEn,
                    {
                      backgroundColor: (theme === 'dark' || globalTheme === 'dark')
                        ? 'rgba(59, 130, 246, 0.18)'
                        : 'rgba(59, 130, 246, 0.12)',
                      borderColor: (theme === 'dark' || globalTheme === 'dark')
                        ? 'rgba(59, 130, 246, 0.38)'
                        : 'rgba(59, 130, 246, 0.28)',
                    },
                  ]}
                >
                  <Text style={styles.langBadgeEnText}>ENGLISH</Text>
                </View>
                <Text style={[styles.langBadgeSub, { color: getSubTextColor() }]}>
                  — Matching Translation
                </Text>
              </View>
              {hasValidEn ? (
                <Text
                  style={[
                    styles.textEn,
                    {
                      color: (theme === 'dark' || globalTheme === 'dark') ? '#e2e8f0' : '#1e293b',
                      fontSize: Math.round(currentFontSize * 0.94),
                      lineHeight: Math.round(dynamicLineHeight * 0.94),
                    },
                  ]}
                >
                  {textEn}
                </Text>
              ) : (
                <View style={styles.unavailableBox}>
                  <Ionicons name="information-circle-outline" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                  <Text style={[styles.unavailableText, { color: getSubTextColor() }]}>
                    English translation unavailable for this verse
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Compact, Clean Verse Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            onPress={speakVerse}
            style={[
              styles.actionBtn,
              { backgroundColor: localSpeaking ? 'rgba(212, 175, 55, 0.2)' : getBtnBg(), borderColor: getBtnBorder() },
            ]}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Ionicons
              name={localSpeaking ? 'stop-circle' : 'volume-medium-outline'}
              size={13}
              color={localSpeaking ? '#e5a93c' : tintColor}
            />
            <Text style={[styles.actionText, { color: localSpeaking ? '#e5a93c' : tintColor }]}>
              {localSpeaking
                ? (language === 'en' ? 'Stop' : 'አቁም')
                : (language === 'en' ? 'Listen' : (language === 'both' ? 'Listen' : 'ስማ'))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={copyToClipboard}
            style={[styles.actionBtn, { backgroundColor: getBtnBg(), borderColor: getBtnBorder() }]}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Ionicons name="copy-outline" size={13} color={tintColor} />
            <Text style={[styles.actionText, { color: tintColor }]}>
              {language === 'en' ? 'Copy' : (language === 'both' ? 'Copy' : 'ቅዳ')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenActionSheet || onLongPress}
            style={[styles.actionBtn, { backgroundColor: getBtnBg(), borderColor: getBtnBorder() }]}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Ionicons name="ellipsis-horizontal" size={13} color={tintColor} />
            <Text style={[styles.actionText, { color: tintColor }]}>
              {language === 'en' ? 'More' : 'ተጨማሪ'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    marginBottom: 12,
    paddingVertical: 2,
  },
  leftCol: {
    width: 28,
    alignItems: 'center',
    marginRight: 8,
    paddingTop: 4,
  },
  verseNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
  },
  verseNumText: {
    fontSize: 11,
    fontWeight: '800',
  },
  connector: {
    flex: 1,
    width: 1,
    marginVertical: 4,
  },
  contentCol: {
    flex: 1,
    paddingBottom: 4,
  },
  textAm: {
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  textEn: {
    fontSize: 15,
    letterSpacing: 0.15,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  bilingualWrapper: {
    gap: 8,
  },
  bilingualBlock: {
    paddingVertical: 2,
  },
  bilingualBlockEn: {
    marginTop: 2,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  langBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  langBadgeAm: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
  },
  langBadgeAmText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#e5a93c',
    letterSpacing: 0.5,
  },
  langBadgeEn: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
  },
  langBadgeEnText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#60a5fa',
    letterSpacing: 0.8,
  },
  langBadgeSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  unavailableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 2,
  },
  unavailableText: {
    fontSize: 12.5,
    fontStyle: 'italic',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
