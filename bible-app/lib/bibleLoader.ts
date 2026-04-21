import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import { BIBLE_ASSETS } from './bibleAssets';

export async function loadBook(bookId: string) {
  const bookData = BIBLE_ASSETS[bookId];
  if (!bookData) {
    console.warn(`Book data not found for ${bookId}`);
    return { book: BIBLE_BOOKS.find(b => b.id === bookId)!, chapters: [] };
  }
  const chapters = (bookData.chapters || []).map((ch: any) => {
    let verses: any[] = [];
    if (ch.sections) {
      ch.sections.forEach((sec: any) => {
        if (sec.verses) {
          verses = verses.concat(sec.verses.map((v: any) => ({
            verse: v.verse,
            textAm: v.text,
            textEn: v.text_en || ''
          })));
        }
      });
    }
    return {
      chapter: ch.chapter.toString(),
      verses: verses
    };
  });
  return { book: BIBLE_BOOKS.find(b => b.id === bookId)!, chapters };
}

export async function getChapter(bookId: string, chapterId: string) {
  try {
    const { book, chapters } = await loadBook(bookId);
    let ch = chapters.find((c: any) => c.chapter === chapterId);
    if (!ch) return [];

    let verses = [...ch.verses];

    // Attempt to fetch English translation lazily from bible-api.com
    try {
      const enBookName = book.nameEn.replace(/ /g, '+');
      // Timeout after 3 seconds to not block UI forever
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`https://bible-api.com/${enBookName}+${chapterId}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const enData = await response.json();
        // Merge english verses into our local verses
        verses = verses.map(v => {
          const enVerse = enData.verses.find((ev: any) => ev.verse === v.verse);
          return {
            ...v,
            textEn: enVerse ? enVerse.text.trim() : v.textEn
          };
        });
      }
    } catch (e) {
      // API call failed, ignore and show Amharic only
      console.log('Failed to fetch English chapter', e);
    }

    return verses;
  } catch {
    return [];
  }
}

export async function getVersesByRefs(refs: string[]) {
  const result = [];
  for (const ref of refs) {
    const parts = ref.split(':');
    if (parts.length >= 3) {
      const bookId = parts[0];
      const chapterId = parts[1];
      const verseStr = parts[2].replace('v', '');
      const verseNum = parseInt(verseStr, 10);
      
      const verses = await getChapter(bookId, chapterId);
      const verseData = verses.find((v: any) => v.verse === verseNum);
      if (verseData) {
        result.push({
          ...verseData,
          verseRef: ref
        });
      }
    }
  }
  return result;
}

export async function getRandomVerse() {
  const bookIndex = Math.floor(Math.random() * BIBLE_BOOKS.length);
  const book = BIBLE_BOOKS[bookIndex];
  
  try {
    const { book: loadedBook, chapters } = await loadBook(book.id);
    if (!chapters || chapters.length === 0) return null;
    
    const chapterIndex = Math.floor(Math.random() * chapters.length);
    const chapterObj = chapters[chapterIndex];
    if (!chapterObj.verses || chapterObj.verses.length === 0) return null;
    
    // Use getChapter to fetch merged English text
    const verses = await getChapter(book.id, chapterObj.chapter);
    if (!verses || verses.length === 0) return null;

    const verseIndex = Math.floor(Math.random() * verses.length);
    const verse = verses[verseIndex];
    
    return {
      bookName: book.name,
      bookNameEn: book.nameEn,
      chapter: chapterObj.chapter,
      ...verse,
      verseRef: `${book.id}:${chapterObj.chapter}:v${verse.verse}`
    };
  } catch (e) {
    console.log('Error getting random verse:', e);
    return null;
  }
}
