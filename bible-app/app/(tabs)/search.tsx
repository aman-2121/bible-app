import React, { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchBible } from '@/lib/search';
import VerseItem from '@/components/VerseItem';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useBible } from '@/context/BibleContext';
import GlobalControls from '@/components/GlobalHeader';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { language } = useBible();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const executeSearch = async () => {
    if (!query) return;
    setLoading(true);
    const res = await searchBible(query);
    setResults(res);
    setLoading(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const labels = {
    title: language === 'am' ? 'ፍለጋ' : (language === 'both' ? 'ፍለጋ / Search' : 'Search Bible'),
    placeholder: language === 'am' ? 'ጥቅሶችን ይፈልጉ...' : (language === 'both' ? 'ፈልግ / Search...' : 'Search verses...'),
    emptyHint: language === 'am' ? 'ለመፈለግ መተየብ ይጀምሩ' : (language === 'both' ? 'መተየብ ይጀምሩ / Start typing to search' : 'Start typing to search'),
    noResult: language === 'am' ? 'ምንም ጥቅስ አልተገኘም' : (language === 'both' ? 'ምንም አልተገኘም / No matches' : 'No verses match your search'),
    searching: language === 'am' ? 'እየፈለገ ነው...' : 'Searching...',
    tryDifferent: language === 'am' ? 'ሌሎች ቃላቶችን ይሞክሩ' : 'Try different keywords'
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{labels.title}</Text>
          <GlobalControls />
        </View>
        <View style={[styles.searchBarContainer, { backgroundColor: surfaceColor }]}>
          <Ionicons name="search" size={20} color={tintColor} style={styles.searchIcon} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder={labels.placeholder}
            placeholderTextColor={textColor + '44'}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={executeSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={textColor + '44'} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            {labels.searching}
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <VerseItem {...item} verseRef={item.verseRef} />}
          keyExtractor={(item, index) => item.verseRef + index.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconBg, { backgroundColor: tintColor + '11' }]}>
                <Ionicons name={query ? 'search-outline' : 'book-outline'} size={64} color={tintColor + '33'} />
              </View>
              <Text style={[styles.emptyText, { color: textColor }]}>
                {query ? labels.noResult : labels.emptyHint}
              </Text>
              {query && (
                <Text style={[styles.emptySubText, { color: textColor + '66' }]}>
                  {labels.tryDifferent}
                </Text>
              )}
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingBottom: 35,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.6,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
});

