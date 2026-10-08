import { Platform } from 'react-native';

export type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';

type PlaybackCallback = () => void;
type ErrorCallback = (err: Error) => void;

interface PlaybackCallbacks {
  onStart?: PlaybackCallback;
  onDone?: PlaybackCallback;
  onStopped?: PlaybackCallback;
  onError?: ErrorCallback;
}

let activeAudioElement: any = null;
let currentCallbacks: PlaybackCallbacks | null = null;
let currentState: AudioPlaybackState = 'idle';

const stateListeners = new Set<(state: AudioPlaybackState) => void>();

export function subscribeToAudioState(listener: (state: AudioPlaybackState) => void): () => void {
  stateListeners.add(listener);
  listener(currentState);
  return () => {
    stateListeners.delete(listener);
  };
}

function setAudioState(state: AudioPlaybackState) {
  currentState = state;
  stateListeners.forEach(listener => listener(state));
}

export function getCurrentAudioState(): AudioPlaybackState {
  return currentState;
}

/**
 * Stops any actively playing audio source.
 */
export async function stopAudioSource(): Promise<void> {
  if (activeAudioElement) {
    try {
      if (Platform.OS === 'web' || typeof window !== 'undefined') {
        activeAudioElement.pause();
        activeAudioElement.currentTime = 0;
      }
    } catch {}
    activeAudioElement = null;
  }

  if (currentCallbacks?.onStopped) {
    try {
      currentCallbacks.onStopped();
    } catch {}
  }

  currentCallbacks = null;
  setAudioState('stopped');
}

/**
 * Pauses active audio playback.
 */
export function pauseAudioSource(): void {
  if (activeAudioElement) {
    try {
      if (Platform.OS === 'web' || typeof window !== 'undefined') {
        activeAudioElement.pause();
      }
    } catch {}
    setAudioState('paused');
  }
}

/**
 * Resumes paused audio playback.
 */
export function resumeAudioSource(): void {
  if (activeAudioElement) {
    try {
      if (Platform.OS === 'web' || typeof window !== 'undefined') {
        activeAudioElement.play();
        setAudioState('playing');
      }
    } catch {
      setAudioState('error');
    }
  }
}

/**
 * Plays an audio source (URL or base64 data URI).
 */
export async function playAudioSource(
  sourceUri: string,
  callbacks?: PlaybackCallbacks
): Promise<boolean> {
  await stopAudioSource();
  currentCallbacks = callbacks || null;
  setAudioState('loading');

  try {
    if (Platform.OS === 'web' || typeof window !== 'undefined') {
      const audio = new Audio(sourceUri);
      activeAudioElement = audio;

      audio.onplay = () => {
        setAudioState('playing');
        if (currentCallbacks?.onStart) currentCallbacks.onStart();
      };

      audio.onended = () => {
        setAudioState('idle');
        activeAudioElement = null;
        if (currentCallbacks?.onDone) currentCallbacks.onDone();
      };

      audio.onerror = (e) => {
        console.warn('Audio playback error:', e);
        setAudioState('error');
        activeAudioElement = null;
        if (currentCallbacks?.onError) {
          currentCallbacks.onError(new Error('Audio playback failed'));
        }
      };

      await audio.play();
      return true;
    }

    // On native environments without DOM Audio:
    // If expo-av is dynamically available:
    try {
      const ExpoAv = require('expo-av');
      if (ExpoAv && ExpoAv.Audio) {
        const { sound } = await ExpoAv.Audio.Sound.createAsync(
          { uri: sourceUri },
          { shouldPlay: true }
        );
        activeAudioElement = sound;
        setAudioState('playing');
        if (currentCallbacks?.onStart) currentCallbacks.onStart();

        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.didJustFinish) {
            setAudioState('idle');
            sound.unloadAsync().catch(() => {});
            activeAudioElement = null;
            if (currentCallbacks?.onDone) currentCallbacks.onDone();
          }
        });
        return true;
      }
    } catch {
      // Fallback if native audio player is not configured
    }

    setAudioState('stopped');
    return false;
  } catch (err: any) {
    console.warn('Error playing audio source:', err);
    setAudioState('error');
    if (currentCallbacks?.onError) {
      currentCallbacks.onError(err);
    }
    return false;
  }
}
