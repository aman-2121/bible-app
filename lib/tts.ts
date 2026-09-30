import * as Speech from 'expo-speech';
import { Alert } from 'react-native';

export const TTS_CONFIG = {
  englishLocale: 'en-US',
  amharicLocale: 'am-ET',
  defaultRate: 0.95,
};

export type AppLanguage = 'am' | 'en' | 'both';

export interface SpeakOptions {
  textAm: string;
  textEn?: string;
  appLang: AppLanguage;
  rate?: number;
  onStart?: () => void;
  onDone?: () => void;
  onStopped?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Checks if an Amharic (am-ET) TTS voice is installed on the device.
 * On Android, if Google Text-to-Speech does not have the Amharic voice data,
 * getAvailableVoicesAsync() will return a list without an 'am' voice.
 */
export async function isAmharicVoiceAvailable(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices || voices.length === 0) {
      // If voice list is empty (e.g. web or restricted sandbox), let Speech.speak attempt playback
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
 * Shows a user-friendly modal alert explaining that Amharic TTS is missing on the device,
 * with instructions on how to install it in Android settings.
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
 * Resolves the appropriate locale and text according to user language settings:
 * - English -> uses 'en-US' and speaks English text.
 * - Amharic or Bilingual -> uses 'am-ET' and speaks original Amharic text (never translates).
 */
export function resolveSpeechTarget(
  textAm: string,
  textEn?: string,
  appLang: AppLanguage = 'am'
): { text: string; language: string; isAmharic: boolean } {
  if (appLang === 'en') {
    return {
      text: textEn && textEn.trim() ? textEn.trim() : textAm.trim(),
      language: TTS_CONFIG.englishLocale,
      isAmharic: false,
    };
  }

  // Amharic or Bilingual (both): ALWAYS speak original Amharic text, never translated!
  return {
    text: textAm.trim(),
    language: TTS_CONFIG.amharicLocale,
    isAmharic: true,
  };
}

/**
 * High-level speak function that:
 * 1. Resolves language (en-US vs am-ET) and text.
 * 2. Checks voice availability for Amharic.
 * 3. Alerts user if Amharic TTS is unavailable instead of silently failing.
 * 4. Calls Speech.speak with proper error and completion handlers.
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

  // Pre-check for Amharic on Android / device
  if (isAmharic) {
    const isAvail = await isAmharicVoiceAvailable();
    if (!isAvail) {
      showAmharicVoiceMissingAlert(options.appLang);
      if (options.onError) options.onError(new Error('Amharic voice not installed'));
      return false;
    }
  }

  try {
    await Speech.stop();
  } catch {}

  let hasStarted = false;

  Speech.speak(text, {
    language: ttsLang,
    rate: options.rate || TTS_CONFIG.defaultRate,
    onStart: () => {
      hasStarted = true;
      if (options.onStart) options.onStart();
    },
    onDone: () => {
      if (options.onDone) options.onDone();
    },
    onStopped: () => {
      if (options.onStopped) options.onStopped();
    },
    onError: (err) => {
      console.warn('TTS Speech error:', err, 'Language:', ttsLang);
      if (isAmharic && !hasStarted) {
        showAmharicVoiceMissingAlert(options.appLang);
      }
      if (options.onError) options.onError(err);
    },
  });

  return true;
}

/**
 * Stops any active speech playback safely.
 */
export async function stopSpeech(): Promise<void> {
  try {
    await Speech.stop();
  } catch (e) {
    console.warn('Error stopping speech:', e);
  }
}
