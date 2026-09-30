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
  lineSpacing = 1.8,
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

  // If user switches language while local verse audio is active, seamlessly re-trigger with new language
  useEffect(() => {
    if (localSpeaking) {
      speakBibleText({
        textAm,
        textEn,
        appLang: language,
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

  const getBarColor = () => {
    if (theme === 'dark' || globalTheme === 'dark') return 'rgba(255,255,255,0.06)';
    if (theme === 'sepia') return 'rgba(91,70,54,0.06)';
    return 'rgba(15, 23, 42, 0.05)';
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
          backgroundColor: 'rgba(212, 175, 55, 0.12)',
          borderLeftWidth: 3,
          borderLeftColor: '#c69214',
          borderRadius: 12,
        },
      ]}
    >
      <View style={styles.leftCol}>
        <TouchableOpacity
          style={[
            styles.verseNumCircle,
            isBookmarked && { backgroundColor: '#c69214' },
            activeSpeaking && { borderColor: '#c69214', backgroundColor: 'rgba(212, 175, 55, 0.2)' },
          ]}
          onPress={() => toggleBookmark(verseRef)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.verseNumText,
              { color: isBookmarked ? '#fff' : (theme === 'dark' ? '#fff' : tintColor) },
            ]}
          >
            {verse}
          </Text>
        </TouchableOpacity>
        <View
          style={[
            styles.connector,
            { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(128,128,128,0.15)' },
          ]}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.contentCol,
          highlightColor
            ? { backgroundColor: highlightColor, borderRadius: 8, paddingHorizontal: 8, marginHorizontal: -4 }
            : null,
        ]}
        activeOpacity={0.8}
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
                  marginTop: 6,
                },
              ]}
            >
              {textEn || '(English translation loading or offline)'}
            </Text>
          </View>
        )}

        <View style={styles.actionBar}>
          <TouchableOpacity
            onPress={speakVerse}
            style={[
              styles.actionBtn,
              { backgroundColor: localSpeaking ? 'rgba(212, 175, 55, 0.2)' : getBarColor() },
            ]}
          >
            <Ionicons
              name={localSpeaking ? 'stop-circle' : 'volume-medium-outline'}
              size={15}
              color={localSpeaking ? '#e5a93c' : tintColor}
            />
            <Text style={[styles.actionText, { color: localSpeaking ? '#e5a93c' : tintColor }]}>
              {localSpeaking
                ? (language === 'en' ? 'Stop' : 'አቁም')
                : (language === 'en' ? 'Listen' : (language === 'both' ? 'Listen/ስማ' : 'ስማ'))}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={copyToClipboard} style={[styles.actionBtn, { backgroundColor: getBarColor() }]}>
            <Ionicons name="copy-outline" size={15} color={tintColor} />
            <Text style={[styles.actionText, { color: tintColor }]}>
              {language === 'en' ? 'Copy' : (language === 'both' ? 'Copy/ቅዳ' : 'ቅዳ')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onOpenActionSheet || onLongPress}
            style={[styles.actionBtn, { backgroundColor: getBarColor() }]}
          >
            <Ionicons name="ellipsis-horizontal" size={15} color={tintColor} />
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
    paddingHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 4,
  },
  leftCol: {
    width: 36,
    alignItems: 'center',
    marginRight: 6,
  },
  verseNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(128,128,128,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.15)',
  },
  verseNumText: {
    fontSize: 12,
    fontWeight: '800',
  },
  connector: {
    flex: 1,
    width: 1.5,
    marginVertical: 4,
  },
  contentCol: {
    flex: 1,
    paddingLeft: 4,
    paddingBottom: 8,
  },
  textAm: {
    fontSize: 20,
    lineHeight: 36,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  textEn: {
    fontSize: 15,
    lineHeight: 25,
    marginTop: 4,
    letterSpacing: 0.1,
  },
  actionBar: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
