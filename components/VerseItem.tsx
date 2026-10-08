import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { speakBibleText, stopSpeech } from '@/lib/tts';
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

  // If user switches language while local verse audio is active, re-trigger with new language
  useEffect(() => {
    if (localSpeaking) {
      speakBibleText({
        textAm,
        textEn,
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
    const txt = language === 'en' ? textEn || textAm : textAm;
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

    await stopSpeech();
    const success = await speakBibleText({
      textAm,
      textEn,
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
        {language === 'am' && (
          <ThemedText
            style={[
              styles.textAm,
              { color: getTextColor(), fontSize: currentFontSize, lineHeight: dynamicLineHeight },
            ]}
          >
            {textAm}
          </ThemedText>
        )}

        {language === 'en' && (
          <Text
            style={[
              styles.textEn,
              { color: getTextColor(), fontSize: currentFontSize, lineHeight: dynamicLineHeight },
            ]}
          >
            {textEn || textAm}
          </Text>
        )}

        {language === 'both' && (
          <View>
            <ThemedText
              style={[
                styles.textAm,
                { color: getTextColor(), fontSize: currentFontSize, lineHeight: dynamicLineHeight },
              ]}
            >
              {textAm}
            </ThemedText>
            <Text
              style={[
                styles.textEn,
                {
                  color: getSubTextColor(),
                  fontSize: Math.round(currentFontSize * 0.88),
                  lineHeight: Math.round(dynamicLineHeight * 0.88),
                  marginTop: 4,
                },
              ]}
            >
              {textEn || '(English translation loading or offline)'}
            </Text>
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
    marginBottom: 10,
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
    letterSpacing: 0.1,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
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
