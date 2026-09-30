import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { addJournalEntry, JournalCategory } from '@/lib/storage';

const CATEGORIES: Array<{ id: JournalCategory; labelAm: string; labelEn: string; icon: string }> = [
  { id: 'prayer', labelAm: 'ጸሎት', labelEn: 'Prayer', icon: 'hand-left' },
  { id: 'gratitude', labelAm: 'ምስጋና', labelEn: 'Gratitude', icon: 'heart' },
  { id: 'study', labelAm: 'የጥናት ማስታወሻ', labelEn: 'Bible Study', icon: 'book' },
  { id: 'reflection', labelAm: 'አስተንትኖ', labelEn: 'Reflection', icon: 'sparkles' },
  { id: 'notes', labelAm: 'ማስታወሻ', labelEn: 'Notes', icon: 'document-text' },
];

export default function NewJournalEntryScreen() {
  const insets = useSafeAreaInsets();
  const { language, theme } = useBible();
  const isDark = theme === 'dark';
  const { verseRef } = useLocalSearchParams<{ verseRef?: string }>();

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [category, setCategory] = useState<JournalCategory>('prayer');
  const [title, setTitle] = useState(verseRef ? `ጥቅስ / Note on ${verseRef}` : '');
  const [text, setText] = useState('');
  const [attachedRefs, setAttachedRefs] = useState<string[]>(verseRef ? [verseRef] : []);
  const [newRefInput, setNewRefInput] = useState('');

  const labels = {
    header: language === 'am' ? 'አዲስ የጸሎት ማስታወሻ' : 'New Journal Entry',
    save: language === 'am' ? 'አስቀምጥ' : 'Save Entry',
    titlePlaceholder: language === 'am' ? 'ርዕስ (አማራጭ)...' : 'Title (Optional)...',
    textPlaceholder:
      language === 'am'
        ? 'ጸሎትዎን፣ ምስጋናዎን ወይም ከመጽሐፍ ቅዱስ ያገኙትን ማስተዋል እዚህ ይፃፉ...'
        : 'Write your prayer, gratitude, spiritual reflections, or study notes...',
    categoryLabel: language === 'am' ? 'የማስታወሻ ዓይነት' : 'Entry Category',
    versesLabel: language === 'am' ? 'የተያያዙ ጥቅሶች' : 'Attached Verses',
    addVerseBtn: language === 'am' ? '+ ጥቅስ ጨምር' : '+ Add Verse',
  };

  const handleAddVerseRef = () => {
    if (!newRefInput.trim()) return;
    setAttachedRefs([...attachedRefs, newRefInput.trim()]);
    setNewRefInput('');
  };

  const handleRemoveVerseRef = (idx: number) => {
    setAttachedRefs(attachedRefs.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!text.trim() && !title.trim()) {
      router.back();
      return;
    }

    await addJournalEntry({
      title: title.trim() || (language === 'am' ? 'ርዕስ የሌለው' : 'Untitled Entry'),
      text: text.trim(),
      date: new Date().toISOString(),
      category,
      verseRefs: attachedRefs,
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)', borderColor }]}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={20} color={textColor} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: textColor }]}>{labels.header}</Text>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: '#e5a93c' }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>{labels.save}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Category Selector */}
        <Text style={[styles.sectionLabel, { color: textColor + '88' }]}>{labels.categoryLabel}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {CATEGORIES.map(cat => {
            const isSelected = category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catChip,
                  { backgroundColor: surfaceColor, borderColor },
                  isSelected && { backgroundColor: '#e5a93c', borderColor: '#e5a93c' },
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Ionicons
                  name={(cat.icon as any) || 'bookmark'}
                  size={14}
                  color={isSelected ? '#091124' : '#e5a93c'}
                />
                <Text
                  style={[
                    styles.catChipText,
                    { color: isSelected ? '#091124' : textColor },
                    isSelected && { fontWeight: '800' },
                  ]}
                >
                  {language === 'am' ? cat.labelAm : cat.labelEn}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Title Input */}
        <TextInput
          style={[styles.titleInput, { color: textColor, backgroundColor: surfaceColor, borderColor }]}
          placeholder={labels.titlePlaceholder}
          placeholderTextColor={textColor + '44'}
          value={title}
          onChangeText={setTitle}
        />

        {/* Main Text Content */}
        <TextInput
          style={[styles.contentInput, { color: textColor, backgroundColor: surfaceColor, borderColor }]}
          placeholder={labels.textPlaceholder}
          placeholderTextColor={textColor + '44'}
          multiline
          textAlignVertical="top"
          value={text}
          onChangeText={setText}
        />

        {/* Attached Verses */}
        <Text style={[styles.sectionLabel, { color: textColor + '88', marginTop: 14 }]}>
          {labels.versesLabel}
        </Text>
        <View style={styles.verseTagsRow}>
          {attachedRefs.map((ref, idx) => (
            <View key={idx} style={[styles.verseTag, { backgroundColor: surfaceColor, borderColor }]}>
              <Ionicons name="book-outline" size={12} color="#c69214" />
              <Text style={[styles.verseTagText, { color: textColor }]}>{ref}</Text>
              <TouchableOpacity onPress={() => handleRemoveVerseRef(idx)}>
                <Ionicons name="close" size={14} color={textColor + '88'} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add Another Verse Input */}
        <View style={styles.addRefRow}>
          <TextInput
            style={[styles.addRefInput, { color: textColor, backgroundColor: surfaceColor, borderColor }]}
            placeholder="e.g. 1:1:v1 or Genesis 1:1"
            placeholderTextColor={textColor + '44'}
            value={newRefInput}
            onChangeText={setNewRefInput}
          />
          <TouchableOpacity
            style={[styles.addRefBtn, { backgroundColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.15)' }]}
            onPress={handleAddVerseRef}
          >
            <Text style={[styles.addRefBtnText, { color: '#e5a93c' }]}>{labels.addVerseBtn}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#091124',
    fontWeight: '800',
    fontSize: 13,
  },
  scrollContent: {
    padding: 20,
    gap: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.15)',
  },
  catChipText: {
    fontSize: 12,
  },
  titleInput: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  contentInput: {
    height: 180,
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  verseTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  verseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.15)',
  },
  verseTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addRefRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  addRefInput: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  addRefBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addRefBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
