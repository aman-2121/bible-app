import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import { loadBook, loadBookWithCachedEnglish } from './bibleLoader';

export function searchVerses(
  verses: any[],
  query: string,
  language: 'am' | 'en' | 'both' = 'both'
) {
  const q = query.toLowerCase();
  return verses.filter((v) => {
    const matchAm = v.textAm?.toLowerCase().includes(q);
    const matchEn = v.textEn?.toLowerCase().includes(q);
    if (language === 'am') return matchAm;
    if (language === 'en') return matchEn;
    return matchAm || matchEn;
  });
}

export async function searchBible(
  query: string,
  maxResults: number = 50,
  language: 'am' | 'en' | 'both' = 'both'
) {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();
  const results: any[] = [];

  const loader =
    language === 'am' ? loadBook : loadBookWithCachedEnglish;

  for (const book of BIBLE_BOOKS) {
    if (results.length >= maxResults) break;

    try {
      const { chapters } = await loader(book.id);
      for (const ch of chapters) {
        if (results.length >= maxResults) break;

        for (const v of ch.verses) {
          if (results.length >= maxResults) break;

          const matchAm = v.textAm?.toLowerCase().includes(q);
          const matchEn = v.textEn?.toLowerCase().includes(q);

          let matched = false;
          if (language === 'am') matched = matchAm;
          else if (language === 'en') matched = matchEn;
          else matched = matchAm || matchEn;

          if (matched) {
            results.push({
              ...v,
              verseRef: `${book.id}:${ch.chapter}:v${v.verse}`,
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

