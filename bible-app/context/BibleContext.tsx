import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getBookmarks, toggleBookmark as toggleStorageBookmark, getSettings, saveSettings } from '../lib/storage';

interface BibleContextType {
  currentBook: string;
  currentChapter: string;
  language: 'am' | 'en' | 'both';
  theme: 'light' | 'dark';
  bookmarks: string[];
  setCurrentBook: (id: string) => void;
  setCurrentChapter: (id: string) => void;
  toggleLanguage: () => void;
  setLanguage: (lang: 'am' | 'en' | 'both') => void;
  toggleTheme: () => void;
  toggleBookmark: (verseRef: string) => void;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [currentBook, setCurrentBookState] = useState('1');
  const [currentChapter, setCurrentChapterState] = useState('1');
  const [language, setLanguageState] = useState<'am' | 'en' | 'both'>('am');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    getBookmarks().then(setBookmarks);
    getSettings().then(settings => {
      if (settings.language) setLanguageState(settings.language as any);
      if (settings.theme) setTheme(settings.theme as any);
    });
  }, []);

  const setCurrentBook = (id: string) => setCurrentBookState(id);
  const setCurrentChapter = (id: string) => setCurrentChapterState(id);
  
  const toggleLanguage = () => {
    setLanguageState(prev => {
      const next = prev === 'am' ? 'en' : (prev === 'en' ? 'both' : 'am');
      saveSettings({ language: next, theme });
      return next;
    });
  };

  const setLanguage = (next: 'am' | 'en' | 'both') => {
    setLanguageState(next);
    saveSettings({ language: next, theme });
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      saveSettings({ language, theme: next });
      return next;
    });
  };

  const toggleBookmark = async (verseRef: string) => {
    const newBookmarks = await toggleStorageBookmark(verseRef);
    setBookmarks(newBookmarks);
  };

  return (
    <BibleContext.Provider value={{ 
      currentBook, currentChapter, language, theme, bookmarks, 
      setCurrentBook, setCurrentChapter, toggleLanguage, setLanguage, toggleTheme, toggleBookmark 
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

