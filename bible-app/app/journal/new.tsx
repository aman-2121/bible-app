import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getJournalEntries, saveJournalEntries } from '@/lib/storage';

export default function NewJournalEntryScreen() {
  const insets = useSafeAreaInsets();
  const { verseRef } = useLocalSearchParams<{ verseRef?: string }>();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [title, setTitle] = useState(verseRef ? `Thoughts on ${verseRef.split(':v')[0]}` : '');
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
        
        <Text style={[styles.headerTitle, { color: textColor }]}>New Entry</Text>
        
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={[styles.saveBtnText, { color: tintColor }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          style={[styles.titleInput, { color: textColor }]}
          placeholder="Title (Optional)"
          placeholderTextColor={textColor + '66'}
          value={title}
          onChangeText={setTitle}
        />
        
        {verseRef && (
          <View style={[styles.verseTag, { backgroundColor: tintColor + '22' }]}>
            <Ionicons name="bookmark" size={14} color={tintColor} />
            <Text style={[styles.verseTagText, { color: tintColor }]}>Attached: {verseRef}</Text>
          </View>
        )}

        <TextInput
          style={[styles.textInput, { color: textColor }]}
          placeholder="Write your thoughts, prayers, or study notes..."
          placeholderTextColor={textColor + '66'}
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
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)'
  },
  iconBtn: {
    padding: 5,
    marginLeft: -5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveBtn: {
    padding: 5,
    marginRight: -5,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    flexGrow: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 15,
  },
  verseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  verseTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textInput: {
    fontSize: 18,
    lineHeight: 28,
    flex: 1,
    minHeight: 300,
  }
});
