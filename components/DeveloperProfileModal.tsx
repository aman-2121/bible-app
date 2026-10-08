import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import OrthodoxCross from '@/components/OrthodoxCross';

interface DeveloperProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DeveloperProfileModal({
  visible,
  onClose,
}: DeveloperProfileModalProps) {
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

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.cardContainer,
            {
              backgroundColor: isDark ? '#0d172e' : surfaceColor,
              borderColor: isDark ? 'rgba(212, 175, 55, 0.25)' : borderColor,
            },
          ]}
        >
          {/* Header Bar */}
          <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.crossCircle}>
                <OrthodoxCross size={20} variant="gondar" glow={true} />
              </View>
              <Text style={[styles.headerTitle, { color: textColor }]}>
                {language === 'am' ? 'ስለ አልሚው / Developer Profile' : 'Developer Profile'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.05)' },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={18} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Developer Identity Card */}
            <View
              style={[
                styles.profileBox,
                {
                  backgroundColor: isDark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.05)',
                  borderColor: isDark ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.15)',
                },
              ]}
            >
              <View style={styles.avatarRow}>
                {/* Developer Avatar Badge */}
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>AN</Text>
                </View>
                <View style={styles.nameGroup}>
                  <View style={styles.nameBadgeRow}>
                    <Text style={[styles.devName, { color: textColor }]}>
                      Amanuel neby
                    </Text>
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#e5a93c" />
                    </View>
                  </View>
                  <Text style={styles.roleLabel}>Developer</Text>
                  <Text style={[styles.aliasText, { color: textColor + '88' }]}>
                    Aman Markos
                  </Text>
                </View>
              </View>

              {/* Contact Actions */}
              <View style={styles.contactActionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(15, 23, 42, 0.1)' }]}
                  onPress={openEmail}
                  activeOpacity={0.7}
                  accessibilityLabel="Send email"
                >
                  <Ionicons name="mail" size={16} color="#e5a93c" />
                  <Text style={[styles.actionBtnText, { color: textColor }]}>
                    amanmarkos582@gmail.com
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: isDark ? 'rgba(212, 175, 55, 0.3)' : 'rgba(15, 23, 42, 0.1)' }]}
                  onPress={openGitHub}
                  activeOpacity={0.7}
                  accessibilityLabel="Open GitHub profile"
                >
                  <Ionicons name="logo-github" size={16} color="#e5a93c" />
                  <Text style={[styles.actionBtnText, { color: textColor }]}>
                    github.com/aman-2121
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Application Overview */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionHeader}>
                {language === 'am' ? 'ስለ መተግበሪያው' : 'ABOUT APPLICATION'}
              </Text>
              <Text style={[styles.appTitle, { color: textColor }]}>
                81 መጽሐፍ ቅዱስ • Ethiopian Orthodox Bible
              </Text>
              <Text style={[styles.appDescription, { color: textColor + 'cc' }]}>
                A Bible reading application supporting Amharic and English Bible reading, search, bookmarks, daily reading, progress tracking, and audio narration.
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaKey}>Version</Text>
                  <Text style={styles.metaVal}>1.0.0</Text>
                </View>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaKey}>TTS</Text>
                  <Text style={styles.metaVal}>Addis AI Voices 2</Text>
                </View>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaKey}>Canon</Text>
                  <Text style={styles.metaVal}>81 Books</Text>
                </View>
              </View>
            </View>

            {/* Source Credits & Copyright */}
            <View style={[styles.creditsSection, { borderTopColor: borderColor }]}>
              <Text style={[styles.creditsText, { color: textColor + '88' }]}>
                Ethiopian Orthodox Tewahedo Church Canon • 80 Weahadu Project • Addis AI
              </Text>
              <Text style={styles.copyrightText}>
                © 2026 Amanuel neby. All rights reserved.
              </Text>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 20, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: '85%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  profileBox: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e5a93c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#c69214',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '900',
    color: '#070e1e',
    letterSpacing: 0.5,
  },
  nameGroup: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  devName: {
    fontSize: 17,
    fontWeight: '800',
  },
  verifiedBadge: {
    marginTop: 1,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e5a93c',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  aliasText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  contactActionsRow: {
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  infoSection: {
    marginBottom: 14,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#e5a93c',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  appTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaBadge: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.08)',
    alignItems: 'center',
  },
  metaKey: {
    fontSize: 9,
    fontWeight: '700',
    color: '#e5a93c',
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  creditsSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  creditsText: {
    fontSize: 10,
    textAlign: 'center',
  },
  copyrightText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#e5a93c',
  },
});
