import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { getBookmarks, toggleBookmark as toggleStorageBookmark, getSettings, saveSettings } from '../lib/storage';

interface BibleContextType {
  currentBook: string;
  currentChapter: string;
  language: 'am' | 'en' | 'both';
  theme: 'light' | 'dark' | 'system';
  bookmarks: string[];
  sidebarOpen: boolean;
  crossVariant: 'lalibela' | 'gondar' | 'axum' | 'meskel';
  setCurrentBook: (id: string) => void;
  setCurrentChapter: (id: string) => void;
  toggleLanguage: () => void;
  setLanguage: (lang: 'am' | 'en' | 'both') => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleBookmark: (verseRef: string) => void;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  setCrossVariant: (variant: 'lalibela' | 'gondar' | 'axum' | 'meskel') => void;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [currentBook, setCurrentBookState] = useState('1');
  const [currentChapter, setCurrentChapterState] = useState('1');
  const [language, setLanguageState] = useState<'am' | 'en' | 'both'>('am');
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('system');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [crossVariant, setCrossVariantState] = useState<'lalibela' | 'gondar' | 'axum' | 'meskel'>('meskel');
  const [sidebarOpen, setSidebarOpenState] = useState(() => {
    try {
      return Dimensions.get('window').width >= 1024;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    getBookmarks().then(setBookmarks);
    getSettings().then(settings => {
      if (settings.language) setLanguageState(settings.language as any);
      if (settings.theme) setThemeState(settings.theme as any);
      if (settings.crossVariant) setCrossVariantState(settings.crossVariant);
    });
  }, []);

  const setCurrentBook = (id: string) => setCurrentBookState(id);
  const setCurrentChapter = (id: string) => setCurrentChapterState(id);
  
  const toggleLanguage = () => {
    setLanguageState(prev => {
      const next = prev === 'am' ? 'en' : (prev === 'en' ? 'both' : 'am');
      saveSettings({ language: next, theme, crossVariant });
      return next;
    });
  };

  const setLanguage = (next: 'am' | 'en' | 'both') => {
    setLanguageState(next);
    saveSettings({ language: next, theme, crossVariant });
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      saveSettings({ language, theme: next, crossVariant });
      return next;
    });
  };

  const setTheme = (next: 'light' | 'dark' | 'system') => {
    setThemeState(next);
    saveSettings({ language, theme: next, crossVariant });
  };

  const setCrossVariant = (variant: 'lalibela' | 'gondar' | 'axum' | 'meskel') => {
    setCrossVariantState(variant);
    saveSettings({ crossVariant: variant });
  };

  const toggleBookmark = async (verseRef: string) => {
    const newBookmarks = await toggleStorageBookmark(verseRef);
    setBookmarks(newBookmarks);
  };

  const toggleSidebar = () => setSidebarOpenState(prev => !prev);
  const closeSidebar = () => setSidebarOpenState(false);
  const openSidebar = () => setSidebarOpenState(true);
  const setSidebarOpen = (val: boolean | ((prev: boolean) => boolean)) => setSidebarOpenState(val);

  return (
    <BibleContext.Provider value={{ 
      currentBook, currentChapter, language, theme, bookmarks, sidebarOpen, crossVariant,
      setCurrentBook, setCurrentChapter, toggleLanguage, setLanguage, toggleTheme, setTheme, toggleBookmark,
      setSidebarOpen, toggleSidebar, closeSidebar, openSidebar, setCrossVariant,
    }}>
      {children}
    </BibleContext.Provider>
  );
}

export const useBible = () => {
  const context = useContext(BibleContext);
  if (!context) throw new Error('useBible must be inside BibleProvider');
  return context;
};

