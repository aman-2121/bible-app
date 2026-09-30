import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

interface VerseActionSheetProps {
  visible: boolean;
  onClose: () => void;
  verseRef: string;
  currentHighlightColor?: string;
  onHighlight: (color: string) => void;
  onAddNote: () => void;
  onCopy: () => void;
  onShare: () => void;
}

const HIGHLIGHT_COLORS = [
  '#fde047', // Yellow
  '#fbcfe8', // Pink
  '#bbf7d0', // Green
  '#bfdbfe', // Blue
  '#e9d5ff', // Purple
  'transparent' // Remove
];

export default function VerseActionSheet({
  visible,
  onClose,
  verseRef,
  currentHighlightColor,
  onHighlight,
  onAddNote,
  onCopy,
  onShare
}: VerseActionSheetProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.sheet, { backgroundColor }]}>
          <View style={styles.dragHandle} />
          
          <Text style={[styles.title, { color: textColor }]}>Verse {verseRef.split(':v')[1]}</Text>

          {/* Highlight Colors */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Highlight</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
              {HIGHLIGHT_COLORS.map((color) => {
                const isSelected = currentHighlightColor === color;
                const isRemove = color === 'transparent';
                
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: isRemove ? '#f1f5f9' : color },
                      isSelected && { borderWidth: 2, borderColor: tintColor },
                      isRemove && { borderWidth: 1, borderColor: '#cbd5e1', borderStyle: 'dashed' }
                    ]}
                    onPress={() => {
                      onHighlight(color);
                      onClose();
                    }}
                  >
                    {isRemove && <Ionicons name="close" size={20} color="#64748b" />}
                    {isSelected && !isRemove && <Ionicons name="checkmark" size={20} color="rgba(0,0,0,0.5)" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Actions */}
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { onClose(); onAddNote(); }}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="document-text-outline" size={24} color="#3b82f6" />
              </View>
              <Text style={[styles.actionText, { color: textColor }]}>Add Note</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { onClose(); onCopy(); }}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="copy-outline" size={24} color="#10b981" />
              </View>
              <Text style={[styles.actionText, { color: textColor }]}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => { onClose(); onShare(); }}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="share-social-outline" size={24} color="#f59e0b" />
              </View>
              <Text style={[styles.actionText, { color: textColor }]}>Share</Text>
            </TouchableOpacity>
          </View>

        </View>
      </TouchableOpacity>
    </Modal>
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
    padding: 25,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(128,128,128,0.3)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    opacity: 0.7,
  },
  colorRow: {
    gap: 15,
    paddingRight: 20,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  }
});
