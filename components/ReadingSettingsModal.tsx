import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  autoScrollSpeed?: number;
  setAutoScrollSpeed?: (speed: number) => void;
  keepAwake?: boolean;
  setKeepAwake?: (val: boolean) => void;
}

export default function ReadingSettingsModal({
  visible,
  onClose,
  fontSize,
  setFontSize,
  lineSpacing,
  setLineSpacing,
  readingTheme,
  setReadingTheme,
  autoScrollSpeed = 0,
  setAutoScrollSpeed,
  keepAwake = true,
  setKeepAwake,
}: ReadingSettingsModalProps) {
  const tintColor = useThemeColor({}, 'tint');

  const getModalBg = () => {
    if (readingTheme === 'sepia') return '#f4ecd8';
    if (readingTheme === 'dark') return '#0d1527';
    return '#fff';
  };

  const getModalText = () => {
    if (readingTheme === 'dark') return '#f8fafc';
    if (readingTheme === 'sepia') return '#5b4636';
    return '#1a1f36';
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.modalContent, { backgroundColor: getModalBg() }]}>
          <View style={styles.dragBar} />
          <Text style={[styles.modalTitle, { color: getModalText() }]}>የንባብ ምርጫዎች / Reading Settings</Text>

          {/* Font Size Row */}
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: getModalText() }]}>የፊደል መጠን / Font Size</Text>
              <Text style={[styles.settingSub, { color: getModalText() + '88' }]}>{fontSize} pt</Text>
            </View>
            <View style={styles.sizeControls}>
              <TouchableOpacity
                onPress={() => setFontSize(Math.max(14, fontSize - 2))}
                style={styles.sizeBtn}
              >
                <Text style={[styles.btnSymbol, { color: getModalText() }]}>A-</Text>
              </TouchableOpacity>
              <Text style={[styles.fontSizeNum, { color: getModalText() }]}>{fontSize}</Text>
              <TouchableOpacity
                onPress={() => setFontSize(Math.min(34, fontSize + 2))}
                style={styles.sizeBtn}
              >
                <Text style={[styles.btnSymbol, { color: getModalText() }]}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Line Spacing */}
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: getModalText() }]}>የመስመር ክፍተት / Line Spacing</Text>
            <View style={styles.chipGroup}>
              {[1.5, 1.8, 2.2].map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setLineSpacing(s)}
                  style={[styles.chip, lineSpacing === s && { backgroundColor: '#c69214' }]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      lineSpacing === s && { color: '#fff' },
                      lineSpacing !== s && { color: getModalText() },
                    ]}
                  >
                    {s === 1.5 ? 'Narrow' : s === 1.8 ? 'Comfort' : 'Relaxed'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reading Themes */}
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: getModalText() }]}>ገጽታ / Reading Theme</Text>
            <View style={styles.themeGroup}>
              {(['light', 'sepia', 'dark'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setReadingTheme(t)}
                  style={[
                    styles.themeCircle,
                    { backgroundColor: t === 'light' ? '#fff' : t === 'sepia' ? '#f4ecd8' : '#040814' },
                    readingTheme === t && { borderWidth: 3, borderColor: '#c69214' },
                  ]}
                >
                  {readingTheme === t && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={t === 'dark' ? '#fff' : '#c69214'}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Auto Scroll Speed */}
          {setAutoScrollSpeed && (
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: getModalText() }]}>ራስ-ገዝ ማንሸራተት / Auto-Scroll</Text>
              <View style={styles.chipGroup}>
                {[0, 1, 2, 3].map(spd => (
                  <TouchableOpacity
                    key={spd}
                    onPress={() => setAutoScrollSpeed(spd)}
                    style={[styles.chip, autoScrollSpeed === spd && { backgroundColor: '#c69214' }]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        autoScrollSpeed === spd && { color: '#fff' },
                        autoScrollSpeed !== spd && { color: getModalText() },
                      ]}
                    >
                      {spd === 0 ? 'Off' : `${spd}×`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Keep Awake */}
          {setKeepAwake && (
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: getModalText() }]}>ማያ ገጽ እንዳይጠፋ / Keep Screen On</Text>
              <Switch
                value={keepAwake}
                onValueChange={setKeepAwake}
                trackColor={{ false: '#767577', true: '#c69214' }}
                thumbColor="#fff"
              />
            </View>
          )}

          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: '#c69214' }]} onPress={onClose}>
            <Text style={styles.closeBtnText}>ተግብር / Done</Text>
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
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 36,
    elevation: 20,
  },
  dragBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(128,128,128,0.3)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(128,128,128,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  fontSizeNum: {
    fontSize: 16,
    fontWeight: '800',
    minWidth: 24,
    textAlign: 'center',
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(128,128,128,0.12)',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  themeGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  themeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
