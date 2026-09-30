import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ReadingSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineSpacing: number;
  setLineSpacing: (spacing: number) => void;
  readingTheme: 'light' | 'sepia' | 'dark';
  setReadingTheme: (theme: 'light' | 'sepia' | 'dark') => void;
}

export default function ReadingSettingsModal({
  visible,
  onClose,
  fontSize,
  setFontSize,
  lineSpacing,
  setLineSpacing,
  readingTheme,
  setReadingTheme
}: ReadingSettingsModalProps) {
  const tintColor = useThemeColor({}, 'tint');

  const getModalBg = () => {
    if (readingTheme === 'sepia') return '#f4ecd8';
    if (readingTheme === 'dark') return '#1a1a1a';
    return '#fff';
  };

  const getModalText = () => {
    if (readingTheme === 'dark') return '#fff';
    if (readingTheme === 'sepia') return '#5b4636';
    return '#000';
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.modalContent, { backgroundColor: getModalBg() }]}>
          <Text style={[styles.modalTitle, { color: getModalText() }]}>Reading Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: getModalText() }]}>Font Size</Text>
            <View style={styles.sizeControls}>
              <TouchableOpacity onPress={() => setFontSize(Math.max(14, fontSize - 2))} style={styles.sizeBtn}>
                <Text style={[styles.btnSymbol, { color: getModalText() }]}>A-</Text>
              </TouchableOpacity>
              <Text style={[styles.fontSizeNum, { color: getModalText() }]}>{fontSize}</Text>
              <TouchableOpacity onPress={() => setFontSize(Math.min(32, fontSize + 2))} style={styles.sizeBtn}>
                <Text style={[styles.btnSymbol, { color: getModalText() }]}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: getModalText() }]}>Line Spacing</Text>
            <View style={styles.chipGroup}>
              {[1.4, 1.8, 2.2].map((s) => (
                <TouchableOpacity 
                  key={s} 
                  onPress={() => setLineSpacing(s)}
                  style={[styles.chip, lineSpacing === s && { backgroundColor: tintColor }]}
                >
                  <Text style={[styles.chipText, lineSpacing === s && { color: '#fff' }, lineSpacing !== s && { color: getModalText() }]}>
                    {s === 1.4 ? 'Narrow' : s === 1.8 ? 'Normal' : 'Wide'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: getModalText() }]}>Theme</Text>
            <View style={styles.themeGroup}>
              {(['light', 'sepia', 'dark'] as const).map((t) => (
                <TouchableOpacity 
                  key={t} 
                  onPress={() => setReadingTheme(t)}
                  style={[
                    styles.themeCircle, 
                    { backgroundColor: t === 'light' ? '#fff' : t === 'sepia' ? '#f4ecd8' : '#333' },
                    readingTheme === t && { borderWidth: 3, borderColor: tintColor }
                  ]}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.closeBtn, { backgroundColor: tintColor }]} 
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    minHeight: 250,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 25,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  sizeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(128,128,128,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fontSizeNum: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeGroup: {
    flexDirection: 'row',
    gap: 15,
  },
  themeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
  },
  closeBtn: {
    height: 55,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
