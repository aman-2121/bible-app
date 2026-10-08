import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import AppScreenLayout from '@/components/AppScreenLayout';
import OrthodoxCross from '@/components/OrthodoxCross';

export default function ProfileScreen() {
  const { theme, language } = useBible();
  const isDark = theme === 'dark';
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  const openEmail = () => {
    Linking.openURL('mailto:amanmarkos582@gmail.com').catch(err =>
      console.warn('Could not open email client', err)
    );
  };

  const openGitHub = () => {
    Linking.openURL('https://github.com/aman-2121').catch(err =>
      console.warn('Could not open GitHub', err)
    );
  };

  return (
    <AppScreenLayout
      title={language === 'am' ? 'ስለ አልሚው' : 'Developer Profile'}
      subtitle="Amanuel neby (Aman Markos)"
      showBackBtn={true}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#0d172e' : surfaceColor,
              borderColor: isDark ? 'rgba(212, 175, 55, 0.25)' : borderColor,
            },
          ]}
        >
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>AN</Text>
            </View>
            <View style={styles.infoCol}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: textColor }]}>Amanuel neby</Text>
                <Ionicons name="checkmark-circle" size={16} color="#e5a93c" />
              </View>
              <Text style={styles.badge}>Developer</Text>
              <Text style={[styles.alias, { color: textColor + '88' }]}>Aman Markos</Text>
            </View>
          </View>

          {/* Contact Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  borderColor: isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(15, 23, 42, 0.1)',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
                },
              ]}
              onPress={openEmail}
              activeOpacity={0.7}
            >
              <Ionicons name="mail" size={18} color="#e5a93c" />
              <View style={{ flex: 1 }}>
                <Text style={styles.btnLabel}>Email</Text>
                <Text style={[styles.btnVal, { color: textColor }]}>amanmarkos582@gmail.com</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={textColor + '66'} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionBtn,
                {
                  borderColor: isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(15, 23, 42, 0.1)',
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.03)',
                },
              ]}
              onPress={openGitHub}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-github" size={18} color="#e5a93c" />
              <View style={{ flex: 1 }}>
                <Text style={styles.btnLabel}>GitHub</Text>
                <Text style={[styles.btnVal, { color: textColor }]}>aman-2121</Text>
              </View>
              <Ionicons name="open-outline" size={16} color={textColor + '66'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Application Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#0d172e' : surfaceColor,
              borderColor: isDark ? 'rgba(212, 175, 55, 0.25)' : borderColor,
            },
          ]}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.crossCircle}>
              <OrthodoxCross size={20} variant="gondar" glow={true} />
            </View>
            <Text style={[styles.appHeaderTitle, { color: textColor }]}>
              81 መጽሐፍ ቅዱስ • Ethiopian Orthodox Bible
            </Text>
          </View>

          <Text style={[styles.appDesc, { color: textColor + 'cc' }]}>
            A Bible reading application supporting Amharic and English Bible reading, search, bookmarks, daily reading, progress tracking, and audio narration.
          </Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Text style={styles.detailKey}>Application Version</Text>
              <Text style={[styles.detailVal, { color: textColor }]}>1.0.0</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailKey}>Speech Narration</Text>
              <Text style={[styles.detailVal, { color: textColor }]}>Addis AI Voices 2</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailKey}>Canon</Text>
              <Text style={[styles.detailVal, { color: textColor }]}>81 Canonical Books</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailKey}>Languages</Text>
              <Text style={[styles.detailVal, { color: textColor }]}>Amharic & English</Text>
            </View>
          </View>

          <View style={[styles.creditRow, { borderTopColor: borderColor }]}>
            <Text style={[styles.creditText, { color: textColor + '77' }]}>
              Source: Ethiopian Orthodox Tewahedo Church Canon • 80 Weahadu Project • Addis AI
            </Text>
            <Text style={styles.copyrightText}>
              © 2026 Amanuel neby. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e5a93c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#c69214',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#070e1e',
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#e5a93c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  alias: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  btnLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#e5a93c',
    textTransform: 'uppercase',
  },
  btnVal: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  crossCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossEmoji: {
    fontSize: 14,
  },
  appHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  appDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 8,
    marginBottom: 16,
  },
  detailBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(128, 128, 128, 0.06)',
  },
  detailKey: {
    fontSize: 10,
    fontWeight: '700',
    color: '#e5a93c',
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  creditRow: {
    paddingTop: 14,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  creditText: {
    fontSize: 11,
    textAlign: 'center',
  },
  copyrightText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e5a93c',
  },
});
