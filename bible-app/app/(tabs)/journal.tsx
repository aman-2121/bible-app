import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getJournalEntries, JournalEntry } from '@/lib/storage';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const loadEntries = async () => {
    const data = await getJournalEntries();
    // Sort newest first
    setEntries(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const renderItem = ({ item }: { item: JournalEntry }) => {
    const formattedDate = new Date(item.date).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });

    return (
      <View style={[styles.card, { backgroundColor: surfaceColor, borderColor: tintColor + '22' }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>{item.title || 'Untitled Entry'}</Text>
          <Text style={styles.cardDate}>{formattedDate}</Text>
        </View>
        <Text style={[styles.cardText, { color: textColor + 'cc' }]} numberOfLines={3}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Prayer Journal</Text>
      </View>

      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={tintColor + '55'} />
            <Text style={[styles.emptyText, { color: textColor + '88' }]}>
              Your journal is empty. Start writing your thoughts and prayers!
            </Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: tintColor }]}
        onPress={() => router.push('/journal/new')}
      >
        <Ionicons name="pencil" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
    marginLeft: 10,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  }
});
