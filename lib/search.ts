import { BIBLE_BOOKS } from '@/constants/bibleBooks';
import { loadBook, loadBookWithCachedEnglish } from './bibleLoader';

export interface SearchOptions {
  testament?: 'all' | 'old' | 'new';
  bookId?: string;
  exactPhrase?: boolean;
  maxResults?: number;
}

export interface SearchResultVerse {
  bookId: string;
  bookName: string;
  bookNameEn: string;
  chapter: string;
  verse: number;
  textAm: string;
  textEn?: string;
  verseRef: string;
  matchesAm?: boolean;
  matchesEn?: boolean;
}

export async function searchBibleAdvanced(
  query: string,
  language: 'am' | 'en' | 'both' = 'both',
  options: SearchOptions = {}
): Promise<SearchResultVerse[]> {
  const clean = query.trim();
  if (!clean) return [];

  const { testament = 'all', bookId, exactPhrase = false, maxResults = 60 } = options;
  const q = clean.toLowerCase();
  const qWords = q.split(/\s+/).filter(Boolean);

  let targetBooks = BIBLE_BOOKS;
  if (bookId) {
    targetBooks = targetBooks.filter(b => b.id === bookId);
  } else if (testament !== 'all') {
    targetBooks = targetBooks.filter(b => b.testament === testament);
  }

  const results: SearchResultVerse[] = [];
  const loader = language === 'am' ? loadBook : loadBookWithCachedEnglish;

  for (const book of targetBooks) {
    if (results.length >= maxResults) break;

    try {
      const { chapters } = await loader(book.id);
      for (const ch of chapters) {
        if (results.length >= maxResults) break;

        for (const v of ch.verses) {
          if (results.length >= maxResults) break;

          const textAmLow = (v.textAm || '').toLowerCase();
          const textEnLow = (v.textEn || '').toLowerCase();

          let matchAm = false;
          let matchEn = false;

          if (exactPhrase) {
            matchAm = textAmLow.includes(q);
            matchEn = textEnLow.includes(q);
          } else {
            // All words present (AND logic)
            matchAm = qWords.every(word => textAmLow.includes(word));
            matchEn = textEnLow.length > 0 && qWords.every(word => textEnLow.includes(word));
          }

          let matched = false;
          if (language === 'am') matched = matchAm;
          else if (language === 'en') matched = matchEn;
          else matched = matchAm || matchEn;

          if (matched) {
            results.push({
              bookId: book.id,
              bookName: book.name,
              bookNameEn: book.nameEn,
              chapter: ch.chapter,
              verse: v.verse,
              textAm: v.textAm,
              textEn: v.textEn,
              verseRef: `${book.id}:${ch.chapter}:v${v.verse}`,
              matchesAm: matchAm,
              matchesEn: matchEn,
            });
          }
        }
      }
    } catch {
      // Continue next book
    }
  }

  return results;
}

// Backward-compatible search function
export async function searchBible(
  query: string,
  maxResults: number = 50,
  language: 'am' | 'en' | 'both' = 'both'
) {
  return searchBibleAdvanced(query, language, { maxResults });
}
