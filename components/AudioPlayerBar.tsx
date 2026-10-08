import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  TTS_CONFIG,
  resolveSpeechTarget,
  speakBibleText,
  stopSpeech,
  pauseSpeech,
  resumeSpeech,
  AudioPlaybackState,
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

const SPEED_OPTIONS = [0.85, 1.0, 1.25, 1.5];

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

  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>('stopped');
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [currentIdx, setCurrentIdx] = useState(initialVerseIndex);
  const [speedIndex, setSpeedIndex] = useState(1); // 1.0x
  const [autoNextChapter, setAutoNextChapter] = useState(true);

  const isMountedRef = useRef(true);
  const playbackStateRef = useRef<AudioPlaybackState>('stopped');
  playbackStateRef.current = playbackState;

  const currentSpeed = SPEED_OPTIONS[speedIndex];

  // Stop speech on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopSpeech();
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

  // When language switches, smoothly stop and restart with new language & voice
  useEffect(() => {
    if (playbackStateRef.current === 'playing' || playbackStateRef.current === 'loading') {
      stopSpeech();
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
    setPlaybackState('loading');
    setLoadingMessage(language === 'en' ? 'Loading audio...' : 'የአማርኛ ንባብ ድምፅ እየተዘጋጀ ነው...');

    const success = await speakBibleText({
      textAm: verseItem.textAm,
      textEn: verseItem.textEn,
      appLang: language,
      rate: currentSpeed,
      bookId: verseItem.verseRef?.split(':')[0],
      chapterId,
      verse: verseItem.verse,
      onLoading: (msg) => {
        if (isMountedRef.current) {
          setPlaybackState('loading');
          setLoadingMessage(msg);
        }
      },
      onStart: () => {
        if (isMountedRef.current) {
          setPlaybackState('playing');
        }
      },
      onDone: () => {
        if (isMountedRef.current && playbackStateRef.current === 'playing') {
          // Play next verse automatically
          speakVerse(index + 1);
        }
      },
      onStopped: () => {
        if (isMountedRef.current) {
          setPlaybackState('stopped');
        }
      },
      onError: () => {
        if (isMountedRef.current) {
          setPlaybackState('error');
        }
      },
    });

    if (!success && isMountedRef.current) {
      setPlaybackState('stopped');
    }
  };

  // Play: Start narration
  const handlePlay = () => {
    speakVerse(currentIdx);
  };

  // Pause: Pause narration
  const handlePause = () => {
    pauseSpeech();
    setPlaybackState('paused');
  };

  // Resume: Resume from current point
  const handleResume = () => {
    resumeSpeech();
    setPlaybackState('playing');
  };

  // Stop: Reset audio
  const handleStop = async () => {
    await stopSpeech();
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
      stopSpeech();
      setTimeout(() => speakVerse(currentIdx), 150);
    }
  };

  const handleClose = async () => {
    await stopSpeech();
    setPlaybackState('stopped');
    onClose();
  };

  const currentVerseNum = verses[currentIdx]?.verse || 1;
  const totalVerses = verses.length;
  const activeVoiceLabel = language === 'en' ? 'en-US' : 'am-hamen • Addis AI';

  const getStateLabel = () => {
    switch (playbackState) {
      case 'loading':
        return language === 'en' ? 'Preparing audio...' : 'ድምፅ እየተዘጋጀ ነው...';
      case 'playing':
        return language === 'en' ? 'Playing' : 'እየተነበበ ነው';
      case 'paused':
        return language === 'en' ? 'Paused' : 'ለጊዜው ቆሟል';
      case 'stopped':
        return language === 'en' ? 'Stopped' : 'ተቋርጧል';
      case 'error':
        return language === 'en' ? 'Unavailable' : 'አልተገኘም';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor, shadowColor: tintColor }]}>
      {/* Top Info Bar */}
      <View style={styles.infoRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.audioPulse, playbackState === 'playing' && styles.activePulse]}>
            {playbackState === 'loading' ? (
              <ActivityIndicator size="small" color="#e5a93c" />
            ) : (
              <Ionicons
                name={playbackState === 'playing' ? 'volume-high' : 'volume-medium-outline'}
                size={18}
                color="#e5a93c"
              />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.titleBadgeRow}>
              <Text style={[styles.bookTitle, { color: textColor }]} numberOfLines={1}>
                {currentBookName} ምዕራፍ {chapterId}
              </Text>
              <View style={styles.ttsLangBadge}>
                <Text style={styles.ttsLangBadgeText}>{activeVoiceLabel}</Text>
              </View>
            </View>
            <Text style={[styles.verseCounter, { color: textColor + '88' }]}>
              {language === 'am' ? `ጥቅስ ${currentVerseNum} ከ ${totalVerses}` : `Verse ${currentVerseNum} of ${totalVerses}`}
              {' • '}
              <Text style={{ color: playbackState === 'playing' ? '#e5a93c' : textColor + 'aa', fontWeight: '700' }}>
                {getStateLabel()}
              </Text>
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
              size={15}
              color={autoNextChapter ? '#e5a93c' : textColor + '66'}
            />
          </TouchableOpacity>

          {/* Speed Toggle */}
          <TouchableOpacity style={styles.chipBtn} onPress={cycleSpeed} accessibilityLabel="Playback speed">
            <Text style={[styles.speedText, { color: textColor }]}>{currentSpeed}×</Text>
          </TouchableOpacity>

          {/* Close Player */}
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} accessibilityLabel="Close audio player">
            <Ionicons name="close" size={18} color={textColor} />
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
          <Ionicons name="play-skip-back" size={20} color={textColor} />
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
          {playbackState === 'loading' ? (
            <ActivityIndicator size="small" color="#091124" />
          ) : (
            <Ionicons
              name={playbackState === 'playing' ? 'pause' : 'play'}
              size={24}
              color="#091124"
            />
          )}
        </TouchableOpacity>

        {/* Dedicated Stop Button */}
        <TouchableOpacity
          style={[styles.stopBtn, playbackState === 'stopped' && { opacity: 0.35 }]}
          onPress={handleStop}
          disabled={playbackState === 'stopped'}
          accessibilityLabel="Stop audio"
        >
          <Ionicons name="stop" size={17} color={textColor} />
        </TouchableOpacity>

        {/* Next Verse */}
        <TouchableOpacity
          style={[styles.controlBtn, currentIdx + 1 >= verses.length && !onNextChapter && { opacity: 0.3 }]}
          onPress={handleNext}
          disabled={currentIdx + 1 >= verses.length && !onNextChapter}
          accessibilityLabel="Next verse"
        >
          <Ionicons name="play-skip-forward" size={20} color={textColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 12,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  ttsLangBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 5,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  ttsLangBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#e5a93c',
    letterSpacing: 0.3,
  },
  audioPulse: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePulse: {
    backgroundColor: 'rgba(229, 169, 60, 0.25)',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '800',
    flexShrink: 1,
  },
  verseCounter: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipBtn: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(128,128,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 2,
  },
  controlBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
