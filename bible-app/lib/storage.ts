import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Bookmarks ---
export async function getBookmarks(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem('bookmarks');
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveBookmarks(bookmarks: string[]) {
  await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

export async function toggleBookmark(verseRef: string) {
  const bookmarks = await getBookmarks();
  const newBookmarks = bookmarks.includes(verseRef)
    ? bookmarks.filter(v => v !== verseRef)
    : [...bookmarks, verseRef];
  await saveBookmarks(newBookmarks);
  return newBookmarks;
}

// --- Highlights ---
export interface Highlight {
  verseRef: string;
  color: string;
}

export async function getHighlights(): Promise<Highlight[]> {
  try {
    const json = await AsyncStorage.getItem('highlights');
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveHighlights(highlights: Highlight[]) {
  await AsyncStorage.setItem('highlights', JSON.stringify(highlights));
}

// --- Notes ---
export interface Note {
  verseRef: string;
  text: string;
  date: string;
}

export async function getNotes(): Promise<Note[]> {
  try {
    const json = await AsyncStorage.getItem('notes');
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveNotes(notes: Note[]) {
  await AsyncStorage.setItem('notes', JSON.stringify(notes));
}

// --- Journal ---
export interface JournalEntry {
  id: string;
  title: string;
  text: string;
  date: string;
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
  try {
    const json = await AsyncStorage.getItem('journal');
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveJournalEntries(entries: JournalEntry[]) {
  await AsyncStorage.setItem('journal', JSON.stringify(entries));
}

// --- Streaks ---
export interface StreakData {
  count: number;
  lastReadDate: string | null;
}

export async function getStreak(): Promise<StreakData> {
  try {
    const json = await AsyncStorage.getItem('streak');
    return json ? JSON.parse(json) : { count: 0, lastReadDate: null };
  } catch {
    return { count: 0, lastReadDate: null };
  }
}

export async function updateStreak(): Promise<StreakData> {
  const streak = await getStreak();
  const today = new Date().toISOString().split('T')[0];
  
  if (streak.lastReadDate === today) {
    return streak; // Already read today
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  let newCount = 1;
  if (streak.lastReadDate === yesterday) {
    newCount = streak.count + 1; // Continued streak
  }

  const newStreak = { count: newCount, lastReadDate: today };
  await AsyncStorage.setItem('streak', JSON.stringify(newStreak));
  return newStreak;
}

// --- Settings ---
export interface AppSettings {
  language: 'am' | 'en' | 'both';
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'both',
  theme: 'system',
  fontSize: 18,
  lineHeight: 28,
  fontFamily: 'System',
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem('settings');
    if (!json) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(json);
    return { ...DEFAULT_SETTINGS, ...parsed }; // Merge to ensure new fields exist
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<AppSettings>) {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await AsyncStorage.setItem('settings', JSON.stringify(updated));
}
