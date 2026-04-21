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
  const borderColor = useThemeColor({}, 'border');
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

  const placeholder = language === 'am' ? 'ጥቅሶችን ይፈልጉ...' : (language === 'both' ? 'Search / ፈልግ...' : 'Search verses...');
  const emptyHint  = language === 'am' ? 'ለመፈለግ መተየብ ይጀምሩ' : (language === 'both' ? 'Start typing to search verses / መተየብ ይጀምሩ' : 'Start typing to search verses');
  const noResult   = language === 'am' ? 'ምንም ጥቅስ አልተገኘም' : (language === 'both' ? 'No matches found / ምንም አልተገኘም' : 'No verses match your search');
  const title      = language === 'am' ? 'ፍለጋ' : (language === 'both' ? 'ፍለጋ (Search)' : 'Search Bible');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{title}</Text>
          <GlobalControls />
        </View>
        <View style={[styles.searchBarContainer, { backgroundColor: surfaceColor }]}>
          <Ionicons name="search" size={20} color={textColor + '66'} style={styles.searchIcon} />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder={placeholder}
            placeholderTextColor={textColor + '66'}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={executeSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={textColor + '66'} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>
            {language === 'am' ? 'እየፈለገ ነው...' : 'Searching...'}
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
              <Ionicons name={query ? 'search-outline' : 'book-outline'} size={64} color="rgba(128,128,128,0.2)" />
              <Text style={[styles.emptyText, { color: textColor }]}>
                {query ? noResult : emptyHint}
              </Text>
              {query && (
                <Text style={styles.emptySubText}>
                  {language === 'am' ? 'ሌሎች ቃላቶችን ይሞክሩ' : 'Try different keywords'}
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
    paddingBottom: 40,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 12,
    height: 50,
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
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.7,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
