import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';

/** GlobalControls rendered in headers with language dropdown, theme toggle, and profile badge */
export default function GlobalControls({ showProfile = true }: { showProfile?: boolean }) {
  const { language, setLanguage, theme, toggleTheme } = useBible();
  const [showDropdown, setShowDropdown] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  const languages = [
    { id: 'am', label: 'አማርኛ', code: 'AM' },
    { id: 'en', label: 'English', code: 'EN' },
    { id: 'both', label: 'Bilingual (ሁለቱም)', code: 'ALL' },
  ];

  const selectLanguage = (id: string) => {
    setLanguage(id as any);
    setShowDropdown(false);
  };

  const currentLang = languages.find(l => l.id === language) || languages[0];
  const isDark = theme === 'dark';
  const pillBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)';
  const pillBorder = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.1)';

  return (
    <View style={styles.row}>
      {/* Language Trigger Pill */}
      <TouchableOpacity
        onPress={() => setShowDropdown(true)}
        style={[styles.langPill, { backgroundColor: pillBg, borderColor: pillBorder }]}
        activeOpacity={0.8}
      >
        <Ionicons name="globe-outline" size={16} color="#e5a93c" />
        <Text style={[styles.langText, { color: textColor }]}>{currentLang.label}</Text>
        <Ionicons name="chevron-down" size={13} color={textColor + '88'} />
      </TouchableOpacity>

      {/* Theme Toggle Button */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={[styles.circleBtn, { backgroundColor: pillBg, borderColor: pillBorder }]}
        activeOpacity={0.8}
      >
        <Ionicons
          name={theme === 'dark' ? 'sunny' : 'moon'}
          size={17}
          color="#e5a93c"
        />
      </TouchableOpacity>

      {/* Profile / App Badge */}
      {showProfile && (
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          style={[styles.profilePill, { backgroundColor: pillBg, borderColor: pillBorder }]}
          activeOpacity={0.8}
        >
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={13} color="#080f21" />
          </View>
          <Text style={[styles.profileName, { color: textColor }]}>Mezamurit</Text>
        </TouchableOpacity>
      )}

      {/* Contextual Dropdown */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDropdown(false)}>
          <View style={[styles.dropdownContainer, { backgroundColor: surfaceColor, borderColor }]}>
            <Text style={[styles.dropdownHeader, { color: textColor + '88', borderBottomColor: borderColor }]}>ቋንቋ ይምረጡ / Language</Text>
            {languages.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.dropdownItem,
                  language === item.id && { backgroundColor: 'rgba(229, 169, 60, 0.12)' },
                ]}
                onPress={() => selectLanguage(item.id)}
              >
                <Ionicons
                  name="globe"
                  size={16}
                  color={language === item.id ? '#e5a93c' : textColor + '88'}
                />
                <Text
                  style={[
                    styles.itemText,
                    { color: textColor },
                    language === item.id && { color: '#e5a93c', fontWeight: '800' },
                  ]}
                >
                  {item.label}
                </Text>
                {language === item.id && <Ionicons name="checkmark" size={16} color="#e5a93c" />}
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
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  langText: {
    fontSize: 13,
    fontWeight: '700',
  },
  circleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  avatarCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#e5a93c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 65,
    paddingRight: 20,
  },
  dropdownContainer: {
    width: 220,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  dropdownHeader: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  itemText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
