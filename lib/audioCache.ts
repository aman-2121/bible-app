import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'bible_audio_cache_';
const memoryCache = new Map<string, string>();

/**
 * Generates a consistent cache key for verse audio based on text hash, language, and voice.
 * Keeps English and Amharic audio strictly separated.
 */
export function generateAudioCacheKey(
  text: string,
  language: string = 'am',
  voice: string = 'am-hamen'
): string {
  // Simple fast string hash for key uniqueness
  let hash = 0;
  const clean = (text || '').trim();
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `${CACHE_PREFIX}${language}_${voice}_${Math.abs(hash)}`;
}

/**
 * Retrieves cached audio data (base64 or audio URI) if available.
 */
export async function getCachedAudio(key: string): Promise<string | null> {
  try {
    if (memoryCache.has(key)) {
      return memoryCache.get(key) || null;
    }

    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      memoryCache.set(key, stored);
      return stored;
    }
  } catch (err) {
    console.warn('Error reading from audio cache:', err);
  }
  return null;
}

/**
 * Stores audio data in persistent cache and fast memory cache.
 */
export async function setCachedAudio(key: string, audioData: string): Promise<void> {
  try {
    if (!key || !audioData) return;
    memoryCache.set(key, audioData);
    await AsyncStorage.setItem(key, audioData);
  } catch (err) {
    console.warn('Error saving to audio cache:', err);
  }
}

/**
 * Clears cached audio if needed.
 */
export async function clearAudioCache(): Promise<void> {
  try {
    memoryCache.clear();
    const allKeys = await AsyncStorage.getAllKeys();
    const audioKeys = allKeys.filter(k => k.startsWith(CACHE_PREFIX));
    if (audioKeys.length > 0) {
      await AsyncStorage.multiRemove(audioKeys);
    }
  } catch (err) {
    console.warn('Error clearing audio cache:', err);
  }
}
