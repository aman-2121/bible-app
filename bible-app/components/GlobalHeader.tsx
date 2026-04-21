import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';

/** Small icon-bar appended to the END of any header row with a Dropdown for language */
export default function GlobalControls() {
  const { language, setLanguage, theme, toggleTheme } = useBible();
  const [showDropdown, setShowDropdown] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  
  const languages = [
    { id: 'am', label: 'አማርኛ (AM)', icon: 'text' },
    { id: 'en', label: 'English (EN)', icon: 'text-outline' },
    { id: 'both', label: 'Bilingual (ALL)', icon: 'copy-outline' }
  ];

  const selectLanguage = (id: string) => {
    setLanguage(id as any);
    setShowDropdown(false);
  };

  const currentLangLabel = languages.find(l => l.id === language)?.id.toUpperCase() || 'AM';

  return (
    <View style={styles.row}>
      {/* Theme Toggle */}
      <TouchableOpacity onPress={toggleTheme} style={styles.glassBtn}>
        <Ionicons
          name={theme === 'dark' ? 'sunny' : 'moon'}
          size={20}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Language Trigger */}
      <TouchableOpacity 
        onPress={() => setShowDropdown(true)} 
        style={[styles.glassBtn, styles.langBtn]}
      >
        <Text style={styles.btnLabel}>{currentLangLabel}</Text>
        <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      {/* Contextual Dropdown (using transparent Modal for full clickability) */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowDropdown(false)}
        >
          <View style={[styles.dropdownContainer, { backgroundColor: surfaceColor, borderColor: borderColor }]}>
            <Text style={[styles.dropdownHeader, { color: textColor + '88' }]}>Select Language</Text>
            {languages.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.dropdownItem,
                  language === item.id && { backgroundColor: 'rgba(106, 17, 203, 0.1)' }
                ]}
                onPress={() => selectLanguage(item.id)}
              >
                <Ionicons 
                  name={item.icon as any} 
                  size={18} 
                  color={language === item.id ? '#1e3a8a' : textColor} 
                />
                <Text style={[
                  styles.itemText, 
                  { color: textColor },
                  language === item.id && { color: '#1e3a8a', fontWeight: '800' }
                ]}>
                  {item.label}
                </Text>
                {language === item.id && <Ionicons name="checkmark" size={16} color="#1e3a8a" />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  glassBtn: {
    height: 48,
    minWidth: 48,
    borderRadius: 24,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  langBtn: {
    paddingRight: 10,
  },
  btnLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)', // Very faint, just to capture clicks
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60, // Adjusted for safe area/header height
    right: 20,
    width: 220,
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  dropdownHeader: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
    marginBottom: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    gap: 12,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
});
