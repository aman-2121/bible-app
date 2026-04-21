import AsyncStorage from '@react-native-async-storage/async-storage';

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
export async function getSettings() {
  try {
    const json = await AsyncStorage.getItem('settings');
    return json ? JSON.parse(json) : { language: 'am', theme: 'light' };
  } catch {
    return { language: 'am', theme: 'light' };
  }
}

export async function saveSettings(settings: { language: string, theme: string }) {
  await AsyncStorage.setItem('settings', JSON.stringify(settings));
}
