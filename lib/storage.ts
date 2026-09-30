import AsyncStorage from '@react-native-async-storage/async-storage';

// ==========================================
// 1. BOOKMARKS & COLLECTIONS
// ==========================================

export interface BookmarkCollection {
  id: string;
  name: string;
  nameAm: string;
  icon: string;
  isDefault?: boolean;
  verseRefs: string[];
}

export const DEFAULT_COLLECTIONS: BookmarkCollection[] = [
  { id: 'favorites', name: 'Favorite Verses', nameAm: 'ተወዳጅ ጥቅሶች', icon: 'heart', isDefault: true, verseRefs: [] },
  { id: 'prayer', name: 'Prayer', nameAm: 'የጸሎት ጥቅሶች', icon: 'hand-left', isDefault: true, verseRefs: [] },
  { id: 'study', name: 'Bible Study', nameAm: 'የጥናት ጥቅሶች', icon: 'book', isDefault: true, verseRefs: [] },
  { id: 'wisdom', name: 'Wisdom', nameAm: 'ጥበብና ምክር', icon: 'bulb', isDefault: true, verseRefs: [] },
  { id: 'encouragement', name: 'Encouragement', nameAm: 'ማበረታቻ', icon: 'shield-checkmark', isDefault: true, verseRefs: [] },
];

export async function getCollections(): Promise<BookmarkCollection[]> {
  try {
    const json = await AsyncStorage.getItem('bookmark_collections');
    if (!json) {
      // Migrate legacy bookmarks if available
      const legacyBookmarks = await getBookmarks();
      const initial = DEFAULT_COLLECTIONS.map(col => {
        if (col.id === 'favorites') {
          return { ...col, verseRefs: legacyBookmarks };
        }
        return col;
      });
      await AsyncStorage.setItem('bookmark_collections', JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(json);
  } catch {
    return DEFAULT_COLLECTIONS;
  }
}

export async function saveCollections(collections: BookmarkCollection[]) {
  await AsyncStorage.setItem('bookmark_collections', JSON.stringify(collections));
  // Keep legacy bookmarks synced with all collected verse refs
  const allUnique = Array.from(new Set(collections.flatMap(c => c.verseRefs)));
  await saveBookmarks(allUnique);
}

export async function createCollection(name: string, nameAm: string, icon = 'bookmark'): Promise<BookmarkCollection[]> {
  const collections = await getCollections();
  const newCol: BookmarkCollection = {
    id: 'col_' + Date.now().toString(),
    name,
    nameAm: nameAm || name,
    icon,
    verseRefs: [],
  };
  const updated = [...collections, newCol];
  await saveCollections(updated);
  return updated;
}

export async function renameCollection(id: string, newName: string, newNameAm?: string): Promise<BookmarkCollection[]> {
  const collections = await getCollections();
  const updated = collections.map(col => {
    if (col.id === id) {
      return { ...col, name: newName, nameAm: newNameAm || col.nameAm };
    }
    return col;
  });
  await saveCollections(updated);
  return updated;
}

export async function deleteCollection(id: string): Promise<BookmarkCollection[]> {
  const collections = await getCollections();
  const updated = collections.filter(c => c.id !== id || c.isDefault);
  await saveCollections(updated);
  return updated;
}

export async function addVerseToCollection(collectionId: string, verseRef: string): Promise<BookmarkCollection[]> {
  const collections = await getCollections();
  const updated = collections.map(col => {
    if (col.id === collectionId && !col.verseRefs.includes(verseRef)) {
      return { ...col, verseRefs: [...col.verseRefs, verseRef] };
    }
    return col;
  });
  await saveCollections(updated);
  return updated;
}

export async function removeVerseFromCollection(collectionId: string, verseRef: string): Promise<BookmarkCollection[]> {
  const collections = await getCollections();
  const updated = collections.map(col => {
    if (col.id === collectionId) {
      return { ...col, verseRefs: col.verseRefs.filter(v => v !== verseRef) };
    }
    return col;
  });
  await saveCollections(updated);
  return updated;
}

// Legacy direct bookmark helpers
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
  const collections = await getCollections();
  const isCurrentlyInFav = collections.find(c => c.id === 'favorites')?.verseRefs.includes(verseRef);

  let updated: BookmarkCollection[];
  if (isCurrentlyInFav) {
    // Remove from all collections
    updated = collections.map(c => ({
      ...c,
      verseRefs: c.verseRefs.filter(v => v !== verseRef),
    }));
  } else {
    // Add to favorites by default
    updated = collections.map(c => {
      if (c.id === 'favorites') {
        return { ...c, verseRefs: [...c.verseRefs, verseRef] };
      }
      return c;
    });
  }
  await saveCollections(updated);

  const bookmarks = await getBookmarks();
  return bookmarks;
}

// ==========================================
// 2. HIGHLIGHTS & NOTES
// ==========================================

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

// ==========================================
// 3. ENHANCED PRAYER JOURNAL
// ==========================================

export type JournalCategory = 'prayer' | 'gratitude' | 'study' | 'reflection' | 'notes';

export interface JournalEntry {
  id: string;
  title: string;
  text: string;
  date: string;
  category?: JournalCategory;
  verseRefs?: string[];
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

export async function addJournalEntry(entry: Omit<JournalEntry, 'id'>): Promise<JournalEntry[]> {
  const current = await getJournalEntries();
  const newEntry: JournalEntry = {
    ...entry,
    id: Date.now().toString(),
  };
  const updated = [newEntry, ...current];
  await saveJournalEntries(updated);
  return updated;
}

export async function updateJournalEntry(id: string, updates: Partial<JournalEntry>): Promise<JournalEntry[]> {
  const current = await getJournalEntries();
  const updated = current.map(e => (e.id === id ? { ...e, ...updates } : e));
  await saveJournalEntries(updated);
  return updated;
}

export async function deleteJournalEntry(id: string): Promise<JournalEntry[]> {
  const current = await getJournalEntries();
  const updated = current.filter(e => e.id !== id);
  await saveJournalEntries(updated);
  return updated;
}

// ==========================================
// 4. CONTINUE READING
// ==========================================

export interface ContinueReadingData {
  bookId: string;
  bookName: string;
  bookNameEn: string;
  chapterId: string;
  verseNum?: number;
  progressPercent: number;
  timestamp: number;
}

export async function getContinueReading(): Promise<ContinueReadingData | null> {
  try {
    const json = await AsyncStorage.getItem('continue_reading');
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export async function saveContinueReading(data: ContinueReadingData) {
  try {
    await AsyncStorage.setItem('continue_reading', JSON.stringify(data));
  } catch (e) {
    console.error('Error saving continue reading', e);
  }
}

// ==========================================
// 5. STREAKS & READING STATISTICS
// ==========================================

export interface StreakData {
  count: number;
  lastReadDate: string | null;
  longestStreak: number;
  history?: string[];
}

export async function getStreak(): Promise<StreakData> {
  try {
    const json = await AsyncStorage.getItem('streak');
    if (!json) return { count: 0, lastReadDate: null, longestStreak: 0, history: [] };
    const data: StreakData = JSON.parse(json);
    const history = data.history || (data.lastReadDate ? [data.lastReadDate] : []);

    const today = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // If last read was not today and not yesterday, current active streak has broken to 0
    let currentCount = data.count || 0;
    if (!data.lastReadDate || (data.lastReadDate !== today && data.lastReadDate !== yesterday)) {
      currentCount = 0;
    }

    return {
      count: currentCount,
      lastReadDate: data.lastReadDate,
      longestStreak: data.longestStreak || 0,
      history,
    };
  } catch {
    return { count: 0, lastReadDate: null, longestStreak: 0, history: [] };
  }
}

export async function updateStreak(): Promise<StreakData> {
  const streak = await getStreak();
  const today = new Date().toISOString().split('T')[0];
  const history = streak.history || [];
  const updatedHistory = history.includes(today) ? history : [today, ...history];

  if (streak.lastReadDate === today) {
    const updated = { ...streak, history: updatedHistory };
    await AsyncStorage.setItem('streak', JSON.stringify(updated));
    return updated; // Already updated today
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  let newCount = 1;
  if (streak.lastReadDate === yesterday) {
    newCount = (streak.count || 0) + 1;
  }

  const longestStreak = Math.max(streak.longestStreak || 0, newCount);
  const newStreak: StreakData = {
    count: newCount,
    lastReadDate: today,
    longestStreak,
    history: updatedHistory,
  };
  await AsyncStorage.setItem('streak', JSON.stringify(newStreak));
  return newStreak;
}

export interface ReadingStats {
  chaptersRead: string[]; // Set of "bookId:chapterId"
  openedBooks: string[]; // Set of "bookId"
  totalReadingMinutes: number;
}

export async function getReadingStats(): Promise<ReadingStats> {
  try {
    const json = await AsyncStorage.getItem('reading_stats');
    if (!json) return { chaptersRead: [], openedBooks: [], totalReadingMinutes: 0 };
    return JSON.parse(json);
  } catch {
    return { chaptersRead: [], openedBooks: [], totalReadingMinutes: 0 };
  }
}

export async function recordChapterRead(bookId: string, chapterId: string) {
  const stats = await getReadingStats();
  const key = `${bookId}:${chapterId}`;
  if (!stats.chaptersRead.includes(key)) {
    const updated = {
      ...stats,
      chaptersRead: [...stats.chaptersRead, key],
      openedBooks: stats.openedBooks.includes(bookId) ? stats.openedBooks : [...stats.openedBooks, bookId],
    };
    await AsyncStorage.setItem('reading_stats', JSON.stringify(updated));
  }
  // Automatically update streak whenever a chapter is read
  await updateStreak();
}

export async function recordBookOpened(bookId: string) {
  const stats = await getReadingStats();
  if (!stats.openedBooks.includes(bookId)) {
    const updated = {
      ...stats,
      openedBooks: [...stats.openedBooks, bookId],
    };
    await AsyncStorage.setItem('reading_stats', JSON.stringify(updated));
  }
}

export async function addReadingMinutes(minutes: number) {
  const stats = await getReadingStats();
  const updated = {
    ...stats,
    totalReadingMinutes: (stats.totalReadingMinutes || 0) + minutes,
  };
  await AsyncStorage.setItem('reading_stats', JSON.stringify(updated));
}

// ==========================================
// 6. ACHIEVEMENTS SYSTEM
// ==========================================

export interface Achievement {
  id: string;
  icon: string;
  titleAm: string;
  titleEn: string;
  descAm: string;
  descEn: string;
  target: number;
  current: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export const ACHIEVEMENT_DEFINITIONS: Array<{
  id: string;
  icon: string;
  titleAm: string;
  titleEn: string;
  descAm: string;
  descEn: string;
  target: number;
  type: 'chapters' | 'streak' | 'books' | 'bookmarks' | 'highlights' | 'journal' | 'time';
}> = [
  { id: 'first_chapter', icon: '🏆', titleAm: 'የመጀመሪያ ምዕራፍ', titleEn: 'First Chapter', descAm: 'የመጀመሪያዎን ምዕራፍ አነበቡ', descEn: 'Read your first Bible chapter', target: 1, type: 'chapters' },
  { id: 'streak_7', icon: '🔥', titleAm: 'የ7 ቀን ጽናት', titleEn: '7-Day Streak', descAm: 'ለ7 ተከታታይ ቀናት አነበቡ', descEn: 'Read for 7 consecutive days', target: 7, type: 'streak' },
  { id: 'streak_30', icon: '⚡', titleAm: 'የ30 ቀን ጽናት', titleEn: '30-Day Streak', descAm: 'ለ30 ተከታታይ ቀናት አነበቡ', descEn: 'Read for 30 consecutive days', target: 30, type: 'streak' },
  { id: 'chapters_10', icon: '📖', titleAm: '10 ምዕራፎች', titleEn: '10 Chapters Read', descAm: '10 ምዕራፎችን አነበቡ', descEn: 'Read 10 Bible chapters', target: 10, type: 'chapters' },
  { id: 'chapters_50', icon: '📜', titleAm: '50 ምዕራፎች', titleEn: '50 Chapters Read', descAm: '50 ምዕራፎችን አነበቡ', descEn: 'Read 50 Bible chapters', target: 50, type: 'chapters' },
  { id: 'chapters_100', icon: '👑', titleAm: '100 ምዕራፎች', titleEn: 'Century Club', descAm: '100 ምዕራፎችን አነበቡ', descEn: 'Read 100 Bible chapters', target: 100, type: 'chapters' },
  { id: 'explorer_10', icon: '📚', titleAm: 'መጽሐፍ ቅዱስ አሳሽ', titleEn: 'Bible Explorer', descAm: '10 የተለያዩ መጻሕፍትን ከፈቱ', descEn: 'Explored 10 different books', target: 10, type: 'books' },
  { id: 'explorer_81', icon: '🏛️', titleAm: '81ዱ አሳሽ', titleEn: 'Canon Master', descAm: 'ሁሉንም 81 መጻሕፍት ከፈቱ', descEn: 'Explored all 81 canonical books', target: 81, type: 'books' },
  { id: 'first_bookmark', icon: '❤️', titleAm: 'የመጀመሪያ ተወዳጅ', titleEn: 'First Bookmark', descAm: 'የመጀመሪያ ጥቅስዎን አስቀመጡ', descEn: 'Saved your first bookmark', target: 1, type: 'bookmarks' },
  { id: 'first_highlight', icon: '🖍', titleAm: 'የመጀመሪያ ማቅለሚያ', titleEn: 'First Highlight', descAm: 'የመጀመሪያ ጥቅስዎን አቀለሙ', descEn: 'Highlighted your first verse', target: 1, type: 'highlights' },
  { id: 'journal_10', icon: '🙏', titleAm: 'ጸሎተኛ ልብ', titleEn: 'Prayerful Heart', descAm: '10 የጸሎት ማስታወሻዎችን ጻፉ', descEn: 'Created 10 journal entries', target: 10, type: 'journal' },
  { id: 'reading_time_60', icon: '⏱', titleAm: 'የ1 ሰዓት ንባብ', titleEn: 'Dedicated Reader', descAm: '1 ሰዓት መጽሐፍ ቅዱስ አነበቡ', descEn: 'Spent 1 hour reading', target: 60, type: 'time' },
];

export async function getAchievements(): Promise<Achievement[]> {
  const stats = await getReadingStats();
  const streak = await getStreak();
  const bookmarks = await getBookmarks();
  const highlights = await getHighlights();
  const journal = await getJournalEntries();

  return ACHIEVEMENT_DEFINITIONS.map(def => {
    let current = 0;
    if (def.type === 'chapters') current = stats.chaptersRead.length;
    else if (def.type === 'streak') current = Math.max(streak.count, streak.longestStreak || 0);
    else if (def.type === 'books') current = stats.openedBooks.length;
    else if (def.type === 'bookmarks') current = bookmarks.length;
    else if (def.type === 'highlights') current = highlights.length;
    else if (def.type === 'journal') current = journal.length;
    else if (def.type === 'time') current = stats.totalReadingMinutes || 0;

    const isUnlocked = current >= def.target;
    return {
      id: def.id,
      icon: def.icon,
      titleAm: def.titleAm,
      titleEn: def.titleEn,
      descAm: def.descAm,
      descEn: def.descEn,
      target: def.target,
      current: Math.min(current, def.target),
      isUnlocked,
    };
  });
}

// ==========================================
// 7. READING PLANS PROGRESS
// ==========================================

export interface PlanProgressMap {
  [planId: string]: {
    completedDays: number[];
    startedDate: string;
    lastActiveDate: string;
  };
}

export async function getPlanProgress(): Promise<PlanProgressMap> {
  try {
    const json = await AsyncStorage.getItem('plan_progress');
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

export async function savePlanProgress(progress: PlanProgressMap) {
  await AsyncStorage.setItem('plan_progress', JSON.stringify(progress));
}

export async function togglePlanDay(planId: string, day: number): Promise<PlanProgressMap> {
  const map = await getPlanProgress();
  const planData = map[planId] || {
    completedDays: [],
    startedDate: new Date().toISOString(),
    lastActiveDate: new Date().toISOString(),
  };

  const isCompleted = planData.completedDays.includes(day);
  const updatedCompleted = isCompleted
    ? planData.completedDays.filter(d => d !== day)
    : [...planData.completedDays, day];

  const updatedMap = {
    ...map,
    [planId]: {
      ...planData,
      completedDays: updatedCompleted,
      lastActiveDate: new Date().toISOString(),
    },
  };
  await savePlanProgress(updatedMap);
  if (!isCompleted) {
    await updateStreak();
  }
  return updatedMap;
}

// ==========================================
// 8. SEARCH HISTORY
// ==========================================

export async function getSearchHistory(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem('search_history');
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function addSearchHistory(query: string): Promise<string[]> {
  const clean = query.trim();
  if (!clean) return getSearchHistory();
  const list = await getSearchHistory();
  const updated = [clean, ...list.filter(q => q.toLowerCase() !== clean.toLowerCase())].slice(0, 12);
  await AsyncStorage.setItem('search_history', JSON.stringify(updated));
  return updated;
}

export async function clearSearchHistory(): Promise<void> {
  await AsyncStorage.removeItem('search_history');
}

// ==========================================
// 9. APP SETTINGS
// ==========================================

export interface AppSettings {
  language: 'am' | 'en' | 'both';
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  autoScrollSpeed?: number;
  keepScreenAwake?: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'both',
  theme: 'system',
  fontSize: 19,
  lineHeight: 1.8,
  fontFamily: 'System',
  autoScrollSpeed: 0,
  keepScreenAwake: true,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const json = await AsyncStorage.getItem('settings');
    if (!json) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(json);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<AppSettings>) {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await AsyncStorage.setItem('settings', JSON.stringify(updated));
}
