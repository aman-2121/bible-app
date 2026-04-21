import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import { loadBook } from './bibleLoader';

export function searchVerses(verses: any[], query: string, language: 'am' | 'en' = 'am') {
  const q = query.toLowerCase();
  return verses.filter(v => v.textAm.toLowerCase().includes(q) || v.textEn?.toLowerCase().includes(q));
}

export async function searchBible(query: string, maxResults: number = 50) {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();
  const results: any[] = [];
  
  for (const book of BIBLE_BOOKS) {
    if (results.length >= maxResults) break;
    
    try {
      const { chapters } = await loadBook(book.id);
      for (const ch of chapters) {
        if (results.length >= maxResults) break;
        
        for (const v of ch.verses) {
          if (results.length >= maxResults) break;
          
          if (v.textAm?.toLowerCase().includes(q) || v.textEn?.toLowerCase().includes(q)) {
            results.push({
              ...v,
              verseRef: `${book.id}:${ch.chapter}:v${v.verse}`
            });
          }
        }
      }
    } catch (e) {
      // Ignore if book fails to load
    }
  }
  
  return results;
}
