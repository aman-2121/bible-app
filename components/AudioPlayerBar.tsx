import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  TTS_CONFIG,
  resolveSpeechTarget,
  isAmharicVoiceAvailable,
  showAmharicVoiceMissingAlert,
} from '@/lib/tts';

export interface AudioVerseItem {
  verse: number;
  textAm: string;
  textEn?: string;
  verseRef: string;
}

interface AudioPlayerBarProps {
  verses: AudioVerseItem[];
  currentBookName: string;
  chapterId: string;
  initialVerseIndex?: number;
  autoPlay?: boolean;
  onActiveVerseChange: (verseIndex: number) => void;
  onNextChapter?: () => void;
  onClose: () => void;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5];

export default function AudioPlayerBar({
  verses,
  currentBookName,
  chapterId,
  initialVerseIndex = 0,
  autoPlay = true,
  onActiveVerseChange,
  onNextChapter,
  onClose,
}: AudioPlayerBarProps) {
  const { language } = useBible();
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [playbackState, setPlaybackState] = useState<'playing' | 'paused' | 'stopped'>('stopped');
  const [currentIdx, setCurrentIdx] = useState(initialVerseIndex);
  const [speedIndex, setSpeedIndex] = useState(1); // 1.0x by default
  const [autoNextChapter, setAutoNextChapter] = useState(true);

  const isMountedRef = useRef(true);
  const playbackStateRef = useRef<'playing' | 'paused' | 'stopped'>('stopped');
  playbackStateRef.current = playbackState;

  const currentSpeed = SPEED_OPTIONS[speedIndex];

  // Stop speech on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      Speech.stop();
    };
  }, []);

  // Auto-play on mount or when initialVerseIndex changes
  useEffect(() => {
    const targetIdx = initialVerseIndex >= 0 && initialVerseIndex < verses.length ? initialVerseIndex : 0;
    setCurrentIdx(targetIdx);
    if (autoPlay) {
      speakVerse(targetIdx);
    }
  }, [initialVerseIndex]);

  // Automatically change TTS language and voice when the user switches languages
  useEffect(() => {
    if (playbackStateRef.current === 'playing') {
      Speech.stop();
      speakVerse(currentIdx);
    }
  }, [language]);

  const speakVerse = async (index: number) => {
    if (!verses || verses.length === 0 || index >= verses.length) {
      if (index >= verses.length && autoNextChapter && onNextChapter) {
        onNextChapter();
      } else {
        setPlaybackState('stopped');
      }
      return;
    }

    setCurrentIdx(index);
    onActiveVerseChange(index);

    const verseItem = verses[index];
    const { text, language: ttsLang, isAmharic } = resolveSpeechTarget(
      verseItem.textAm,
      verseItem.textEn,
      language
    );

    // If Amharic TTS is requested, verify availability before attempting playback
    if (isAmharic) {
      const isAvail = await isAmharicVoiceAvailable();
      if (!isAvail) {
        setPlaybackState('stopped');
        showAmharicVoiceMissingAlert(language);
        return;
      }
    }

    try {
      await Speech.stop();
    } catch {}

    setPlaybackState('playing');
    let hasStarted = false;

    Speech.speak(text, {
      language: ttsLang,
      rate: currentSpeed,
      onStart: () => {
        hasStarted = true;
      },
      onDone: () => {
        if (isMountedRef.current && playbackStateRef.current === 'playing') {
          speakVerse(index + 1);
        }
      },
      onStopped: () => {
        // Speech stopped or paused
      },
      onError: (err) => {
        console.warn('Speech error on verse:', index, err, 'Lang:', ttsLang);
        if (isAmharic && !hasStarted) {
          showAmharicVoiceMissingAlert(language);
          setPlaybackState('stopped');
        } else if (isMountedRef.current && playbackStateRef.current === 'playing' && index + 1 < verses.length) {
          speakVerse(index + 1);
        }
      },
    });
  };

  // Play: Start playback from current index
  const handlePlay = () => {
    speakVerse(currentIdx);
  };

  // Pause: Pause playback, preserve index
  const handlePause = () => {
    Speech.stop();
    setPlaybackState('paused');
  };

  // Resume: Resume playback from current index
  const handleResume = () => {
    speakVerse(currentIdx);
  };

  // Stop: Stop playback and reset to stopped
  const handleStop = () => {
    Speech.stop();
    setPlaybackState('stopped');
  };

  const handleNext = () => {
    if (currentIdx + 1 < verses.length) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      if (playbackState === 'playing') {
        speakVerse(nextIdx);
      } else {
        onActiveVerseChange(nextIdx);
      }
    } else if (onNextChapter) {
      onNextChapter();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      if (playbackState === 'playing') {
        speakVerse(prevIdx);
      } else {
        onActiveVerseChange(prevIdx);
      }
    }
  };

  const cycleSpeed = () => {
    const nextSpeedIdx = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(nextSpeedIdx);
    if (playbackState === 'playing') {
      Speech.stop();
      setTimeout(() => speakVerse(currentIdx), 150);
    }
  };

  const handleClose = () => {
    Speech.stop();
    setPlaybackState('stopped');
    onClose();
  };

  const currentVerseNum = verses[currentIdx]?.verse || 1;
  const totalVerses = verses.length;
  const activeTtsLocale = language === 'en' ? TTS_CONFIG.englishLocale : TTS_CONFIG.amharicLocale;

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor, shadowColor: tintColor }]}>
      {/* Top Info Bar */}
      <View style={styles.infoRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.audioPulse, playbackState === 'playing' && styles.activePulse]}>
            <Ionicons
              name={playbackState === 'playing' ? 'volume-high' : 'volume-medium-outline'}
              size={18}
              color="#e5a93c"
            />
          </View>
          <View>
            <View style={styles.titleBadgeRow}>
              <Text style={[styles.bookTitle, { color: textColor }]}>
                {currentBookName} ምዕራፍ {chapterId}
              </Text>
              {/* Language Engine Indicator Badge */}
              <View style={styles.ttsLangBadge}>
                <Text style={styles.ttsLangBadgeText}>{activeTtsLocale}</Text>
              </View>
            </View>
            <Text style={[styles.verseCounter, { color: textColor + '88' }]}>
              ጥቅስ / Verse {currentVerseNum} of {totalVerses} • {playbackState.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.rightActions}>
          {/* Auto-advance Next Chapter Toggle */}
          <TouchableOpacity
            style={[styles.chipBtn, autoNextChapter && { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}
            onPress={() => setAutoNextChapter(!autoNextChapter)}
            accessibilityLabel="Auto-advance chapter"
          >
            <Ionicons
              name={autoNextChapter ? 'repeat' : 'repeat-outline'}
              size={16}
              color={autoNextChapter ? '#e5a93c' : textColor + '66'}
            />
          </TouchableOpacity>

          {/* Speed Toggle */}
          <TouchableOpacity style={styles.chipBtn} onPress={cycleSpeed} accessibilityLabel="Playback speed">
            <Text style={[styles.speedText, { color: textColor }]}>{currentSpeed}×</Text>
          </TouchableOpacity>

          {/* Close Player */}
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} accessibilityLabel="Close audio player">
            <Ionicons name="close" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Controls Bar: Prev, Play/Pause/Resume, Stop, Next */}
      <View style={styles.controlsRow}>
        {/* Previous Verse */}
        <TouchableOpacity
          style={[styles.controlBtn, currentIdx === 0 && { opacity: 0.3 }]}
          onPress={handlePrev}
          disabled={currentIdx === 0}
          accessibilityLabel="Previous verse"
        >
          <Ionicons name="play-skip-back" size={22} color={textColor} />
        </TouchableOpacity>

        {/* Play / Pause / Resume Button */}
        <TouchableOpacity
          style={[styles.playPauseBtn, { backgroundColor: '#e5a93c' }]}
          onPress={
            playbackState === 'playing'
              ? handlePause
              : playbackState === 'paused'
              ? handleResume
              : handlePlay
          }
          activeOpacity={0.8}
          accessibilityLabel={playbackState === 'playing' ? 'Pause' : playbackState === 'paused' ? 'Resume' : 'Play'}
        >
          <Ionicons
            name={playbackState === 'playing' ? 'pause' : 'play'}
            size={26}
            color="#091124"
          />
        </TouchableOpacity>

        {/* Dedicated Stop Button */}
        <TouchableOpacity
          style={[styles.stopBtn, playbackState === 'stopped' && { opacity: 0.35 }]}
          onPress={handleStop}
          disabled={playbackState === 'stopped'}
          accessibilityLabel="Stop audio"
        >
          <Ionicons name="stop" size={18} color={textColor} />
        </TouchableOpacity>

        {/* Next Verse */}
        <TouchableOpacity
          style={[styles.controlBtn, currentIdx + 1 >= verses.length && !onNextChapter && { opacity: 0.3 }]}
          onPress={handleNext}
          disabled={currentIdx + 1 >= verses.length && !onNextChapter}
          accessibilityLabel="Next verse"
        >
          <Ionicons name="play-skip-forward" size={22} color={textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 24,
    padding: 16,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ttsLangBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  ttsLangBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#e5a93c',
    letterSpacing: 0.5,
  },
  audioPulse: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePulse: {
    backgroundColor: 'rgba(229, 169, 60, 0.25)',
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  verseCounter: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
