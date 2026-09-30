import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useBible } from '@/context/BibleContext';
import CollectionModal from './CollectionModal';

interface VerseActionSheetProps {
  visible: boolean;
  onClose: () => void;
  verseRef: string;
  currentHighlightColor?: string;
  onHighlight: (color: string) => void;
  onAddNote: () => void;
  onCopy: () => void;
  onShare: () => void;
  onReadAloud?: () => void;
}

const HIGHLIGHT_COLORS = [
  '#fde047', // Yellow
  '#fbcfe8', // Pink
  '#bbf7d0', // Green
  '#bfdbfe', // Blue
  '#e9d5ff', // Purple
  '#fed7aa', // Warm Amber
  'transparent', // Remove
];

export default function VerseActionSheet({
  visible,
  onClose,
  verseRef,
  currentHighlightColor,
  onHighlight,
  onAddNote,
  onCopy,
  onShare,
  onReadAloud,
}: VerseActionSheetProps) {
  const { bookmarks, toggleBookmark, language } = useBible();
  const backgroundColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const [collectionModalVisible, setCollectionModalVisible] = useState(false);

  if (!visible) return null;

  const isBookmarked = bookmarks?.includes(verseRef);
  const verseNumber = verseRef.split(':v')[1] || '';

  const labels = {
    title: language === 'am' ? `ጥቅስ ${verseNumber}` : `Verse ${verseNumber}`,
    highlight: language === 'am' ? 'ማቅለሚያ' : 'Highlight',
    bookmark: isBookmarked ? (language === 'am' ? 'ከተወዳጅ አስወግድ' : 'Saved') : (language === 'am' ? 'ወደ ተወዳጆች' : 'Bookmark'),
    collection: language === 'am' ? 'ወደ ማኅደር' : 'Collection',
    note: language === 'am' ? 'ማስታወሻ' : 'Note',
    listen: language === 'am' ? 'አድምጥ' : 'Listen',
    copy: language === 'am' ? 'ገልብጥ' : 'Copy',
    share: language === 'am' ? 'አጋራ' : 'Share',
  };

  return (
    <>
      <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <View style={[styles.sheet, { backgroundColor }]}>
            <View style={styles.dragHandle} />

            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: textColor }]}>{labels.title}</Text>
              <TouchableOpacity
                style={[styles.bookmarkQuickBtn, isBookmarked && { backgroundColor: '#c69214' }]}
                onPress={() => toggleBookmark(verseRef)}
              >
                <Ionicons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={isBookmarked ? '#fff' : textColor}
                />
                <Text style={[styles.bookmarkQuickText, { color: isBookmarked ? '#fff' : textColor }]}>
                  {labels.bookmark}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Highlight Color Palette */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textColor + '88' }]}>{labels.highlight}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
                {HIGHLIGHT_COLORS.map(color => {
                  const isSelected = currentHighlightColor === color;
                  const isRemove = color === 'transparent';

                  return (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: isRemove ? '#f1f5f9' : color },
                        isSelected && { borderWidth: 3, borderColor: '#c69214' },
                        isRemove && { borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed' },
                      ]}
                      onPress={() => {
                        onHighlight(color);
                        onClose();
                      }}
                    >
                      {isRemove && <Ionicons name="close" size={20} color="#64748b" />}
                      {isSelected && !isRemove && <Ionicons name="checkmark" size={18} color="rgba(0,0,0,0.6)" />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Action Grid */}
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  onClose();
                  setCollectionModalVisible(true);
                }}
              >
                <View style={[styles.actionIconBg, { backgroundColor: 'rgba(212, 175, 55, 0.15)' }]}>
                  <Ionicons name="folder-outline" size={22} color="#c69214" />
                </View>
                <Text style={[styles.actionText, { color: textColor }]}>{labels.collection}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  onClose();
                  onAddNote();
                }}
              >
                <View style={[styles.actionIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
                  <Ionicons name="create-outline" size={22} color="#3b82f6" />
                </View>
                <Text style={[styles.actionText, { color: textColor }]}>{labels.note}</Text>
              </TouchableOpacity>

              {onReadAloud && (
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    onClose();
                    onReadAloud();
                  }}
                >
                  <View style={[styles.actionIconBg, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
                    <Ionicons name="volume-medium-outline" size={22} color="#8b5cf6" />
                  </View>
                  <Text style={[styles.actionText, { color: textColor }]}>{labels.listen}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  onClose();
                  onCopy();
                }}
              >
                <View style={[styles.actionIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Ionicons name="copy-outline" size={22} color="#10b981" />
                </View>
                <Text style={[styles.actionText, { color: textColor }]}>{labels.copy}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  onClose();
                  onShare();
                }}
              >
                <View style={[styles.actionIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
                  <Ionicons name="share-social-outline" size={22} color="#f59e0b" />
                </View>
                <Text style={[styles.actionText, { color: textColor }]}>{labels.share}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <CollectionModal
        visible={collectionModalVisible}
        onClose={() => setCollectionModalVisible(false)}
        verseRef={verseRef}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 36,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  dragHandle: {
    width: 44,
    height: 5,
    backgroundColor: 'rgba(128,128,128,0.3)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  bookmarkQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  bookmarkQuickText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  colorRow: {
    gap: 14,
    paddingRight: 20,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
