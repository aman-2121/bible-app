import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getJournalEntries, JournalEntry } from '@/lib/storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useBible();
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

  const labels = {
    title: language === 'am' ? 'የጸሎት ማስታወሻ' : (language === 'both' ? 'የጸሎት ማስታወሻ / Prayer Journal' : 'Prayer Journal'),
    empty: language === 'am' ? 'ማስታወሻዎ ባዶ ነው። ሀሳቦችዎን እና ጸሎቶችዎን መፃፍ ይጀምሩ!' : (language === 'both' ? 'ማስታወሻዎ ባዶ ነው። ሀሳቦችዎን እና ጸሎቶችዎን መፃፍ ይጀምሩ! / Your journal is empty. Start writing your thoughts and prayers!' : 'Your journal is empty. Start writing your thoughts and prayers!'),
    untitled: language === 'am' ? 'ርዕስ የሌለው' : 'Untitled Entry'
  };

  const renderItem = ({ item }: { item: JournalEntry }) => {
    const formattedDate = new Date(item.date).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: surfaceColor, shadowColor: tintColor }]}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: textColor }]}>{item.title || labels.untitled}</Text>
          <Text style={[styles.cardDate, { color: textColor + '88' }]}>{formattedDate}</Text>
        </View>
        <Text style={[styles.cardText, { color: textColor + 'cc' }]} numberOfLines={3}>
          {item.text}
        </Text>
        <View style={styles.cardFooter}>
          <Ionicons name="chevron-forward" size={16} color={tintColor + '88'} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={[styles.headerIconBg, { backgroundColor: tintColor + '15' }]}>
          <Ionicons name="book" size={24} color={tintColor} />
        </View>
        <Text style={[styles.title, { color: textColor }]}>{labels.title}</Text>
      </View>

      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconBg, { backgroundColor: tintColor + '11' }]}>
              <Ionicons name="journal-outline" size={64} color={tintColor + '33'} />
            </View>
            <Text style={[styles.emptyText, { color: textColor + '88' }]}>
              {labels.empty}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: tintColor }]}
        onPress={() => router.push('/journal/new')}
      >
        <LinearGradient
          colors={[tintColor, tintColor + 'dd']}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  headerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'NotoSansEthiopic-Regular',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    fontFamily: 'NotoSansEthiopic-Regular',
  },
  cardDate: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 10,
  },
  cardText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 10,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 26,
    fontFamily: 'NotoSansEthiopic-Regular',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  fabGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

