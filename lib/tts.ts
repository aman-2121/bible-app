import * as Speech from 'expo-speech';
import { Alert, Platform } from 'react-native';
import { generateAudioCacheKey, getCachedAudio, setCachedAudio } from './audioCache';
import {
  playAudioSource,
  stopAudioSource,
  pauseAudioSource,
  resumeAudioSource,
  AudioPlaybackState,
  subscribeToAudioState,
  getCurrentAudioState,
} from './audioPlayer';

export const TTS_CONFIG = {
  englishLocale: 'en-US',
  amharicLocale: 'am',
  defaultAmharicVoice: 'am-hamen',
  model: 'addis-voice-2',
  defaultRate: 0.95,
  backendEndpoint: process.env.EXPO_PUBLIC_TTS_API_URL || '/api/tts',
  hfModel: 'facebook/mms-tts-amh',
  hfEndpoint: 'https://api-inference.huggingface.co/models/facebook/mms-tts-amh',
};

export type AppLanguage = 'am' | 'en' | 'both';

export interface SpeakOptions {
  textAm: string;
  textEn?: string;
  appLang: AppLanguage;
  rate?: number;
  bookId?: string;
  chapterId?: string;
  verse?: number;
  onLoading?: (message: string) => void;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

let activePlaybackMode: 'expo-speech' | 'cloud-audio' | null = null;

/**
 * Checks if device speech supports Amharic locale (am-ET or am).
 */
export async function isAmharicVoiceAvailable(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices || voices.length === 0) {
      return true;
    }
    return voices.some(v => {
      const lang = (v.language || '').toLowerCase().replace('_', '-');
      return lang.startsWith('am') || lang.includes('am-et');
    });
  } catch {
    return true;
  }
}

/**
 * Finds the best installed Amharic voice on the device.
 */
export async function getBestAmharicVoice(): Promise<Speech.Voice | undefined> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices || voices.length === 0) return undefined;
    return voices.find(v => {
      const lang = (v.language || '').toLowerCase().replace('_', '-');
      return lang === 'am-et' || lang.startsWith('am-') || lang === 'am';
    });
  } catch {
    return undefined;
  }
}

/**
 * Friendly user message when Amharic audio service is temporarily unavailable.
 */
export function showAmharicUnavailableAlert(language: AppLanguage = 'am') {
  const isEn = language === 'en';
  Alert.alert(
    isEn ? 'Amharic Audio Unavailable' : 'የአማርኛ ንባብ ድምፅ አልተገኘም',
    isEn
      ? 'Amharic audio is temporarily unavailable. Please try again later.'
      : 'የአማርኛ ንባብ ድምፅ ለጊዜው አልተገኘም። እባክዎ ቆየት ብለው ይሞክሩ።',
    [{ text: isEn ? 'OK' : 'እሺ', style: 'default' }]
  );
}

/**
 * Friendly user message when device speech voice is missing.
 */
export function showAmharicVoiceMissingAlert(language: AppLanguage = 'am') {
  const isEn = language === 'en';
  Alert.alert(
    isEn ? 'Amharic Voice Not Installed' : 'የአማርኛ ንባብ ድምፅ አልተገኘም',
    isEn
      ? 'The Amharic (am-ET) Text-to-Speech voice is not installed on this Android device.\n\nTo enable Amharic audio:\n1. Open Android Settings → Accessibility → Text-to-speech output\n2. Tap the settings gear next to "Speech Services by Google"\n3. Select "Install voice data" and download Amharic (Ethiopia).'
      : 'በስልክዎ ላይ የአማርኛ ንባብ ድምፅ (am-ET Text-to-Speech) አልተገኘም።\n\nየአማርኛ ድምፅን ለመጫን:\n1. ወደ ስልክዎ Settings → Accessibility → Text-to-speech ይሂዱ\n2. በ "Google Speech Services" አጠገብ ያለውን ማስተካከያ ይጫኑ\n3. "Install voice data" ውስጥ ገብተው የአማርኛ (Ethiopia) ድምፅን ያውርዱ።',
    [{ text: isEn ? 'OK' : 'እሺ', style: 'default' }]
  );
}

/**
 * Resolves the appropriate locale and text:
 * - English -> uses 'en-US' and speaks English Bible text.
 * - Amharic or Bilingual -> uses 'am' and speaks ORIGINAL Amharic Bible text (never translates).
 */
export function resolveSpeechTarget(
  textAm: string,
  textEn?: string,
  appLang: AppLanguage = 'am'
): { text: string; language: string; isAmharic: boolean } {
  if (appLang === 'en') {
    return {
      text: textEn && textEn.trim() ? textEn.trim() : (textAm || '').trim(),
      language: TTS_CONFIG.englishLocale,
      isAmharic: false,
    };
  }

  // Amharic or Bilingual: ALWAYS send original Amharic Bible text, never translated!
  return {
    text: (textAm || '').trim(),
    language: TTS_CONFIG.amharicLocale,
    isAmharic: true,
  };
}

/**
 * Converts binary ArrayBuffer to Base64 in safe chunks
 */
function bufferToBase64(buffer: ArrayBuffer): string | null {
  try {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(
        null,
        bytes.subarray(i, i + chunk) as unknown as number[]
      );
    }
    return typeof btoa === 'function' ? btoa(binary) : null;
  } catch (err) {
    console.warn('Base64 conversion error:', err);
    return null;
  }
}

/**
 * Fetch real-time Amharic TTS audio from Addis AI API
 */
async function fetchAddisAIAudio(text: string, voiceId: string): Promise<string | null> {
  const directApiKey = process.env.EXPO_PUBLIC_ADDIS_AI_API_KEY;
  if (!directApiKey) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch('https://api.addisassistant.com/api/v2/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': directApiKey,
      },
      body: JSON.stringify({
        model: TTS_CONFIG.model,
        voice: {
          language_code: 'am',
          voice_id: voiceId,
        },
        input: {
          text: text.trim(),
        },
      }),
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('audio') || contentType.includes('octet-stream')) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        }
        const buffer = await res.arrayBuffer();
        const base64 = bufferToBase64(buffer);
        if (base64) {
          return `data:${contentType || 'audio/mp3'};base64,${base64}`;
        }
      } else {
        const data = await res.json().catch(() => null);
        return data?.audioBase64 || data?.audioUrl || data?.url || null;
      }
    }
  } catch (e) {
    console.warn('Addis AI fetch error:', e);
  }
  return null;
}

/**
 * Fetch real-time Amharic TTS audio from Hugging Face Meta MMS (facebook/mms-tts-amh)
 */
async function fetchHuggingFaceAudio(text: string): Promise<string | null> {
  try {
    const hfToken = process.env.EXPO_PUBLIC_HF_TOKEN;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (hfToken) {
      headers['Authorization'] = `Bearer ${hfToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(TTS_CONFIG.hfEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: text.trim(),
      }),
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const contentType = res.headers.get('content-type') || '';
      // If the model is currently loading, HF returns JSON {"error": "..."}
      if (contentType.includes('application/json')) {
        return null;
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const blob = await res.blob();
        return URL.createObjectURL(blob);
      }

      const buffer = await res.arrayBuffer();
      const base64 = bufferToBase64(buffer);
      if (base64) {
        return `data:${contentType || 'audio/wav'};base64,${base64}`;
      }
    }
  } catch (e) {
    console.warn('Hugging Face TTS error:', e);
  }
  return null;
}

/**
 * Fetch audio from custom deployed backend proxy (e.g., server/tts-server.js)
 */
async function fetchBackendProxyAudio(text: string, voiceId: string): Promise<string | null> {
  const backendUrl = TTS_CONFIG.backendEndpoint;
  const isAbsoluteUrl = /^https?:\/\//i.test(backendUrl);
  if (Platform.OS !== 'web' && !isAbsoluteUrl) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language: 'am',
        voice: voiceId,
        model: TTS_CONFIG.model,
      }),
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json().catch(() => null);
      return data?.audioBase64 || data?.audioUrl || null;
    }
  } catch (e) {
    console.warn('Backend proxy fetch error:', e);
  }
  return null;
}

/**
 * High-level speak function that:
 * 1. Checks Bible language.
 * 2. If English: uses en-US and device Speech engine.
 * 3. If Amharic:
 *    - Checks persistent cache first for instant zero-latency playback.
 *    - Tries Addis AI if configured.
 *    - Tries Hugging Face Meta MMS Amharic TTS (facebook/mms-tts-amh).
 *    - Tries backend proxy if configured.
 *    - Fallback: Uses on-device Google Speech Services (am-ET) with zero network dependency!
 * 4. Ensures only ONE narration is playing at a time.
 */
export async function speakBibleText(options: SpeakOptions): Promise<boolean> {
  const { text, language: ttsLang, isAmharic } = resolveSpeechTarget(
    options.textAm,
    options.textEn,
    options.appLang
  );

  if (!text) {
    if (options.onDone) options.onDone();
    return false;
  }

  // Stop any active narration
  await stopSpeech();

  // -------------------------------------------------------------
  // ENGLISH TTS: Uses device en-US Speech engine
  // -------------------------------------------------------------
  if (!isAmharic) {
    activePlaybackMode = 'expo-speech';
    try {
      Speech.speak(text, {
        language: TTS_CONFIG.englishLocale,
        rate: options.rate || TTS_CONFIG.defaultRate,
        onStart: () => {
          if (options.onStart) options.onStart();
        },
        onDone: () => {
          activePlaybackMode = null;
          if (options.onDone) options.onDone();
        },
        onStopped: () => {
          activePlaybackMode = null;
          if (options.onStopped) options.onStopped();
        },
        onError: (err) => {
          console.warn('English TTS error:', err);
          activePlaybackMode = null;
          if (options.onError) options.onError(err);
        },
      });
      return true;
    } catch (e: any) {
      console.warn('English TTS exception:', e);
      activePlaybackMode = null;
      if (options.onError) options.onError(e);
      return false;
    }
  }

  // -------------------------------------------------------------
  // AMHARIC TTS: Smart Multi-Tier Engine
  // -------------------------------------------------------------
  const voiceId = TTS_CONFIG.defaultAmharicVoice;
  const cacheKey = generateAudioCacheKey(text, 'am', voiceId);

  // 1. Check audio cache (Instant playback, saves bandwidth & costs)
  const cachedAudio = await getCachedAudio(cacheKey);
  if (cachedAudio) {
    activePlaybackMode = 'cloud-audio';
    const played = await playAudioSource(cachedAudio, {
      onStart: options.onStart,
      onDone: () => {
        activePlaybackMode = null;
        if (options.onDone) options.onDone();
      },
      onStopped: () => {
        activePlaybackMode = null;
        if (options.onStopped) options.onStopped();
      },
      onError: (err) => {
        activePlaybackMode = null;
        if (options.onError) options.onError(err);
      },
    });
    if (played) return true;
  }

  // 2. Audio is not cached: Notify loading state
  const loadingMsg = options.appLang === 'en'
    ? 'Preparing Amharic audio...'
    : 'የአማርኛ ንባብ ድምፅ እየተዘጋጀ ነው...';
  if (options.onLoading) options.onLoading(loadingMsg);

  try {
    let audioSource: string | null = null;

    // Tier 1A: Addis AI (if API key provided)
    if (process.env.EXPO_PUBLIC_ADDIS_AI_API_KEY) {
      audioSource = await fetchAddisAIAudio(text, voiceId);
    }

    // Tier 1B: Hugging Face Meta MMS Amharic TTS (facebook/mms-tts-amh)
    if (!audioSource) {
      audioSource = await fetchHuggingFaceAudio(text);
    }

    // Tier 1C: Backend Proxy URL (if configured)
    if (!audioSource) {
      audioSource = await fetchBackendProxyAudio(text, voiceId);
    }

    // If neural cloud audio was obtained, cache and play it
    if (audioSource) {
      await setCachedAudio(cacheKey, audioSource);
      activePlaybackMode = 'cloud-audio';
      const played = await playAudioSource(audioSource, {
        onStart: options.onStart,
        onDone: () => {
          activePlaybackMode = null;
          if (options.onDone) options.onDone();
        },
        onStopped: () => {
          activePlaybackMode = null;
          if (options.onStopped) options.onStopped();
        },
        onError: (err) => {
          activePlaybackMode = null;
          if (options.onError) options.onError(err);
        },
      });
      if (played) return true;
    }

    // -------------------------------------------------------------
    // Tier 2: Offline On-Device Speech (Google Speech Services am-ET)
    // Works 100% offline without internet connection or API keys!
    // -------------------------------------------------------------
    const hasAmharicNative = await isAmharicVoiceAvailable();
    if (hasAmharicNative) {
      activePlaybackMode = 'expo-speech';
      const bestVoice = await getBestAmharicVoice();
      Speech.speak(text, {
        language: 'am-ET',
        voice: bestVoice?.identifier,
        rate: options.rate || TTS_CONFIG.defaultRate,
        onStart: options.onStart,
        onDone: () => {
          activePlaybackMode = null;
          if (options.onDone) options.onDone();
        },
        onStopped: () => {
          activePlaybackMode = null;
          if (options.onStopped) options.onStopped();
        },
        onError: () => {
          activePlaybackMode = null;
          showAmharicVoiceMissingAlert(options.appLang);
          if (options.onError) options.onError(new Error('Amharic audio unavailable'));
        },
      });
      return true;
    }

    // Amharic voice data is not downloaded in Android settings: guide user
    activePlaybackMode = null;
    showAmharicVoiceMissingAlert(options.appLang);
    if (options.onError) {
      options.onError(new Error('Amharic audio voice is not installed on this device.'));
    }
    return false;
  } catch (err: any) {
    activePlaybackMode = null;
    showAmharicVoiceMissingAlert(options.appLang);
    if (options.onError) options.onError(err);
    return false;
  }
}

/**
 * Pauses active speech playback.
 */
export function pauseSpeech(): void {
  if (activePlaybackMode === 'expo-speech') {
    try {
      Speech.pause();
    } catch {
      Speech.stop();
    }
  } else if (activePlaybackMode === 'cloud-audio') {
    pauseAudioSource();
  }
}

/**
 * Resumes paused speech playback.
 */
export function resumeSpeech(): void {
  if (activePlaybackMode === 'expo-speech') {
    try {
      Speech.resume();
    } catch {}
  } else if (activePlaybackMode === 'cloud-audio') {
    resumeAudioSource();
  }
}

/**
 * Completely stops any active speech or audio playback and resets state.
 */
export async function stopSpeech(): Promise<void> {
  try {
    await Speech.stop();
  } catch {}
  await stopAudioSource();
  activePlaybackMode = null;
}

export { AudioPlaybackState, subscribeToAudioState, getCurrentAudioState };
