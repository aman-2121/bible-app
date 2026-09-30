import React from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function ChapterScreen() {
  const { bookId = '1', chapterId = '1' } = useLocalSearchParams<{ bookId?: string; chapterId?: string }>();
  return <Redirect href={`/read/${bookId || '1'}/${chapterId || '1'}`} />;
}
