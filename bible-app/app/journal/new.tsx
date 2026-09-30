import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getJournalEntries, saveJournalEntries } from '@/lib/storage';

export default function NewJournalEntryScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useBible();
  const { verseRef } = useLocalSearchParams<{ verseRef?: string }>();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const labels = {
    header: language === 'am' ? 'አዲስ ማስታወሻ' : (language === 'both' ? 'አዲስ ማስታወሻ / New Entry' : 'New Entry'),
    save: language === 'am' ? 'አስቀምጥ' : (language === 'both' ? 'አስቀምጥ / Save' : 'Save'),
    placeholderTitle: language === 'am' ? 'ርዕስ (አማራጭ)' : 'Title (Optional)',
    placeholderText: language === 'am' ? 'ሀሳቦችዎን፣ ጸሎቶችዎን ወይም የጥናት ማስታወሻዎችዎን ይፃፉ...' : 'Write your thoughts, prayers, or study notes...',
    attached: language === 'am' ? 'የተያያዘ ጥቅስ' : 'Attached Reference',
    defaultTitlePrefix: language === 'am' ? 'ስለ ' : 'Thoughts on '
  };

  const [title, setTitle] = useState(verseRef ? `${labels.defaultTitlePrefix}${verseRef.split(':v')[0]}` : '');
  const [text, setText] = useState('');

  const handleSave = async () => {
    if (!text.trim() && !title.trim()) {
      router.back();
      return;
    }

    const currentEntries = await getJournalEntries();
    const newEntry = {
      id: Date.now().toString(),
      title: title.trim(),
      text: text.trim(),
      date: new Date().toISOString()
    };

    await saveJournalEntries([...currentEntries, newEntry]);
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={textColor} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: textColor }]}>{labels.header}</Text>
        
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={[styles.saveBtnText, { color: tintColor }]}>{labels.save}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={[styles.titleInput, { color: textColor }]}
          placeholder={labels.placeholderTitle}
          placeholderTextColor={textColor + '44'}
          value={title}
          onChangeText={setTitle}
        />
        
        {verseRef && (
          <View style={[styles.verseTag, { backgroundColor: tintColor + '15' }]}>
            <View style={[styles.verseIconBg, { backgroundColor: tintColor }]}>
              <Ionicons name="bookmark" size={12} color="#fff" />
            </View>
            <Text style={[styles.verseTagText, { color: tintColor }]}>{labels.attached}: {verseRef}</Text>
          </View>
        )}

        <TextInput
          style={[styles.textInput, { color: textColor }]}
          placeholder={labels.placeholderText}
          placeholderTextColor={textColor + '44'}
          multiline
          autoFocus
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.05)'
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  saveBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    padding: 25,
    flexGrow: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },
  verseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 25,
    gap: 8,
  },
  verseIconBg: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseTagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  textInput: {
    fontSize: 18,
    lineHeight: 30,
    flex: 1,
    minHeight: 400,
  }
});

