import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBible } from '@/context/BibleContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import OrthodoxCross from './OrthodoxCross';

interface OrthodoxCrossModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function OrthodoxCrossModal({ visible, onClose }: OrthodoxCrossModalProps) {
  const { language, theme } = useBible();
  const isDark = theme === 'dark';

  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const isAm = language === 'am';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContainer,
            { backgroundColor: surfaceColor, borderColor },
          ]}
          onPress={e => e.stopPropagation()}
        >
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: borderColor }]}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeWrap}>
                <OrthodoxCross size={26} variant="meskel" glow={true} />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: textColor }]}>
                  {isAm ? 'መስቀለ መስቀል (እደ መስቀል)' : 'Meskel Hand Cross'}
                </Text>
                <Text style={[styles.modalSubtitle, { color: textColor + '88' }]}>
                  {isAm
                    ? 'የካህናት የበረከት መስቀል ከመሠረተ ታቦት ጋር'
                    : 'Sacred Clergy Blessing Cross with Tabot Base'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)' },
              ]}
              activeOpacity={0.7}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* Center Sacred Cross Showcase */}
            <View style={styles.showcaseBox}>
              <View style={styles.crossGlowHalo}>
                <OrthodoxCross size={68} variant="meskel" glow={true} />
              </View>
              <Text style={styles.showcaseCaption}>
                {isAm
                  ? 'መስቀለ መስቀል — የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ እደ መስቀል'
                  : 'Meskel Hand Cross — Ethiopian Orthodox Clergy Blessing Cross'}
              </Text>
            </View>

            {/* Sacred Prayer of the Holy Cross (ጸሎተ መስቀል) */}
            <View style={[styles.prayerCard, { borderColor: 'rgba(229, 169, 60, 0.35)' }]}>
              <View style={styles.prayerBadge}>
                <Ionicons name="sparkles" size={13} color="#e5a93c" />
                <Text style={styles.prayerBadgeText}>
                  {isAm ? 'ጸሎተ ቅዱስ መስቀል' : 'Prayer of the Holy Cross'}
                </Text>
              </View>

              {/* Ge'ez / Amharic Prayer */}
              <Text style={styles.prayerAmharic}>
                “መስቀል ኃይላችን ነው፤ መስቀል ጽንዓችን ነው፤ መስቀል ቤዛችን ነው፤ መስቀል የነፍሳችን መዳኛ ነው።{'\n'}
                አይሁድ ካዱ እኛ ግን አመንነ፤ ያመንን እኛ በመስቀሉ ዳንን።”
              </Text>

              {/* Priest's Blessing */}
              <Text style={styles.blessingAmharic}>
                “እግዚአብሔር አምላክ በመስቀሉ ይባርከን፤ በቸርነቱም ይጠብቀን። አሜን።”
              </Text>

              {/* English Translation */}
              <Text style={styles.prayerEnglish}>
                “The Cross is our power; The Cross is our strength; The Cross is our redemption; The Cross is the salvation of our soul.{'\n'}
                The unbelievers denied, but we believed; and we who believe are saved by His Cross.{'\n'}
                May the Lord bless us through His Holy Cross. Amen.”
              </Text>
            </View>

            {/* Sacred Structure Breakdown */}
            <Text style={[styles.sectionHeading, { color: textColor }]}>
              {isAm ? 'የመስቀለ መስቀል ቅዱስ ምሥጢር' : 'The Sacred Meaning of the Meskel Cross'}
            </Text>

            <View style={styles.featuresList}>
              {/* Feature 1: The Tabot Base */}
              <View
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(15, 23, 42, 0.03)',
                    borderColor: 'rgba(229, 169, 60, 0.28)',
                  },
                ]}
              >
                <View style={styles.featureIconBox}>
                  <Ionicons name="cube-outline" size={20} color="#e5a93c" />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={[styles.featureTitle, { color: textColor }]}>
                    {isAm ? 'መሠረተ ታቦት (ጽላት / ጐልጐታ)' : 'The Tabot / Ark of the Covenant Base'}
                  </Text>
                  <Text style={[styles.featureDesc, { color: textColor + '99' }]}>
                    {isAm
                      ? 'መስቀሉ በታቦት መሠረት ላይ ጸንቶ ይቆማል — የብሉይ ኪዳን ታቦትና የሐዲስ ኪዳን መስቀል የተዋሐዱበት፣ ኪዳንና ድኅነት የማይነጣጠሉ መሆናቸውን ይመሰክራል።'
                      : 'The Cross stands firmly upon the Tabot base, symbolizing that the Old Covenant Ark and the New Covenant Cross are divinely united in God’s eternal salvation.'}
                  </Text>
                </View>
              </View>

              {/* Feature 2: Priest's Blessing Loops */}
              <View
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(15, 23, 42, 0.03)',
                    borderColor: 'rgba(229, 169, 60, 0.28)',
                  },
                ]}
              >
                <View style={styles.featureIconBox}>
                  <Ionicons name="hand-right-outline" size={20} color="#e5a93c" />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={[styles.featureTitle, { color: textColor }]}>
                    {isAm ? 'የበረከት ቀለበቶች (እደ መስቀል)' : 'Clergy Blessing Hand Loops'}
                  </Text>
                  <Text style={[styles.featureDesc, { color: textColor + '99' }]}>
                    {isAm
                      ? 'ካህናት ምእመናንን የሚባርኩበትና የሚያማትቡበት የተቀደሰ እደ መስቀል ነው። በሥላሴ ስም ሰላምንና ጸጋን ያድላል።'
                      : 'Carried in the hands of clergy to bestow holy blessing and divine peace upon the faithful in the name of the Father, Son, and Holy Spirit.'}
                  </Text>
                </View>
              </View>

              {/* Feature 3: Flared Cross Arms */}
              <View
                style={[
                  styles.featureCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'rgba(15, 23, 42, 0.03)',
                    borderColor: 'rgba(229, 169, 60, 0.28)',
                  },
                ]}
              >
                <View style={styles.featureIconBox}>
                  <Ionicons name="sparkles-outline" size={20} color="#e5a93c" />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={[styles.featureTitle, { color: textColor }]}>
                    {isAm ? 'ራሰ መስቀልና የወርቅ ጥልፍልፍ' : 'Flared Cross Arms & Filigree'}
                  </Text>
                  <Text style={[styles.featureDesc, { color: textColor + '99' }]}>
                    {isAm
                      ? 'አራቱ የመስቀል ክንፎች ወንጌል ወደ አራቱም መዓዘናት መዳረሱን፣ በመሃል ያለው ዕንቁ ደግሞ የክርስቶስን አዳኝነት ያበስራል።'
                      : 'The four flared arms represent the Gospel reaching the four corners of the earth, with the center jewel proclaiming the redemption of Christ.'}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action Button */}
          <View style={[styles.footerRow, { borderTopColor: borderColor }]}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.doneBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>
                {isAm ? 'አሜን (እሺ)' : 'Amen (Close)'}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 25, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '88%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    padding: 18,
  },
  showcaseBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  crossGlowHalo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(229, 169, 60, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  showcaseCaption: {
    color: '#e5a93c',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  prayerCard: {
    backgroundColor: 'rgba(229, 169, 60, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  prayerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 169, 60, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  prayerBadgeText: {
    color: '#e5a93c',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  prayerAmharic: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  blessingAmharic: {
    color: '#ffd875',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 12,
  },
  prayerEnglish: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  featuresList: {
    gap: 10,
    marginBottom: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(229, 169, 60, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  featureDesc: {
    fontSize: 11.5,
    lineHeight: 17,
  },
  footerRow: {
    padding: 16,
    borderTopWidth: 1,
  },
  doneBtn: {
    backgroundColor: '#e5a93c',
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#080f21',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
