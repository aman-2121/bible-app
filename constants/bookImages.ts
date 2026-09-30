import { ImageSourcePropType } from 'react-native';

const BOOK_THUMBNAILS: ImageSourcePropType[] = [
  require('@/assets/images/hero1.jpg'),
  require('@/assets/images/hero2.jpg'),
  require('@/assets/images/hero3.jpg'),
  require('@/assets/images/hero4.jpg'),
  require('@/assets/images/download.jpg'),
  require('@/assets/images/download (1).jpg'),
  require('@/assets/images/download (2).jpg'),
  require('@/assets/images/download (3).jpg'),
  require('@/assets/images/download (4).jpg'),
  require('@/assets/images/download (5).jpg'),
  require('@/assets/images/download (6).jpg'),
  require('@/assets/images/download (7).jpg'),
  require('@/assets/images/download (8).jpg'),
  require('@/assets/images/download (9).jpg'),
  require('@/assets/images/download (10).jpg'),
  require('@/assets/images/download (11).jpg'),
  require('@/assets/images/download (12).jpg'),
  require('@/assets/images/download (13).jpg'),
  require('@/assets/images/download (14).jpg'),
];

/**
 * Returns a stable, beautiful artwork thumbnail for any of the 81 Bible books.
 */
export function getBookThumbnail(bookId: string): ImageSourcePropType {
  const idNum = parseInt(bookId, 10) || 1;
  const index = (idNum - 1) % BOOK_THUMBNAILS.length;
  return BOOK_THUMBNAILS[index];
}

export const HOLY_BIBLE_COVER = require('@/assets/images/hero1.jpg');
