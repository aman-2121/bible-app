import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCollections, saveCollections, createCollection, BookmarkCollection } from '@/lib/storage';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';

interface CollectionModalProps {
  visible: boolean;
  onClose: () => void;
  verseRef: string;
}

export default function CollectionModal({ visible, onClose, verseRef }: CollectionModalProps) {
  const { language } = useBible();
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [collections, setCollections] = useState<BookmarkCollection[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColNameAm, setNewColNameAm] = useState('');

  useEffect(() => {
    if (visible) {
      loadCollections();
    }
  }, [visible]);

  const loadCollections = async () => {
    const list = await getCollections();
    setCollections(list);
  };

  const toggleVerseInCollection = async (collectionId: string) => {
    const updated = collections.map(col => {
      if (col.id === collectionId) {
        const has = col.verseRefs.includes(verseRef);
        return {
          ...col,
          verseRefs: has ? col.verseRefs.filter(v => v !== verseRef) : [...col.verseRefs, verseRef],
        };
      }
      return col;
    });
    setCollections(updated);
    await saveCollections(updated);
  };

  const handleCreate = async () => {
    if (!newColName.trim() && !newColNameAm.trim()) return;
    const name = newColName.trim() || newColNameAm.trim();
    const nameAm = newColNameAm.trim() || name;
    const updated = await createCollection(name, nameAm, 'folder');
    setCollections(updated);
    setNewColName('');
    setNewColNameAm('');
    setIsCreating(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.dialog, { backgroundColor: surfaceColor }]} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              {language === 'am' ? 'ወደ ጥቅስ ማኅደር ጨምር' : (language === 'both' ? 'ጥቅስ ማኅደር / Collections' : 'Add to Collection')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={collections}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isIncluded = item.verseRefs.includes(verseRef);
              const displayName = language === 'am' ? item.nameAm : (language === 'both' ? `${item.nameAm} (${item.name})` : item.name);

              return (
                <TouchableOpacity
                  style={[styles.itemRow, isIncluded && { backgroundColor: tintColor + '10' }]}
                  onPress={() => toggleVerseInCollection(item.id)}
                >
                  <View style={styles.iconNameGroup}>
                    <Ionicons name={(item.icon as any) || 'bookmark'} size={20} color={isIncluded ? '#c69214' : textColor + '77'} />
                    <Text style={[styles.colName, { color: textColor }, isIncluded && { fontWeight: '700', color: tintColor }]}>
                      {displayName}
                    </Text>
                  </View>
                  <Ionicons
                    name={isIncluded ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isIncluded ? '#c69214' : textColor + '44'}
                  />
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.list}
          />

          {isCreating ? (
            <View style={styles.createBox}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: tintColor + '44' }]}
                placeholder={language === 'am' ? 'የማኅደሩ ስም (አማርኛ)...' : 'Collection Name (Amharic)...'}
                placeholderTextColor={textColor + '55'}
                value={newColNameAm}
                onChangeText={setNewColNameAm}
              />
              <TextInput
                style={[styles.input, { color: textColor, borderColor: tintColor + '44' }]}
                placeholder="Collection Name (English)..."
                placeholderTextColor={textColor + '55'}
                value={newColName}
                onChangeText={setNewColName}
              />
              <View style={styles.createButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsCreating(false)}>
                  <Text style={{ color: textColor }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#c69214' }]} onPress={handleCreate}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.newBtn} onPress={() => setIsCreating(true)}>
              <Ionicons name="add-circle-outline" size={20} color="#c69214" />
              <Text style={[styles.newBtnText, { color: '#c69214' }]}>
                {language === 'am' ? 'አዲስ ማኅደር ፍጠር' : '+ New Collection'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    borderRadius: 24,
    padding: 20,
    maxHeight: '80%',
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  list: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  iconNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  colName: {
    fontSize: 15,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
    marginTop: 8,
  },
  newBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  createBox: {
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
    paddingTop: 12,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  createButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 6,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
  },
});
