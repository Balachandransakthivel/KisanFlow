import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useLang } from '../../contexts/LangContext';

interface AIPredictionCardProps {
  estimatedWait: number;
  crowdLevel: 'low' | 'moderate' | 'high';
  recommendation?: string;
  slotTime?: string;
}

const CROWD_CONFIG = {
  low: { icon: '🟢', color: Colors.success, bg: Colors.successLight },
  moderate: { icon: '🟡', color: Colors.warning, bg: Colors.warningLight },
  high: { icon: '🔴', color: Colors.error, bg: Colors.errorLight },
};

export function AIPredictionCard({ estimatedWait, crowdLevel, recommendation, slotTime }: AIPredictionCardProps) {
  const { t } = useLang();
  const cfg = CROWD_CONFIG[crowdLevel];

  return (
    <View style={[styles.card, Shadow.md]}>
      <View style={styles.header}>
        <MaterialIcons name="psychology" size={20} color={Colors.accent} />
        <Text style={styles.title}>{t('aiPrediction')}</Text>
        <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI</Text></View>
      </View>

      <View style={styles.row}>
        <View style={styles.waitBox}>
          <Text style={styles.waitNum}>{estimatedWait}</Text>
          <Text style={styles.waitLbl}>{t('minutes')}</Text>
          <Text style={styles.waitSub}>{t('estimatedWait')}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.crowdBox}>
          <Text style={styles.crowdIcon}>{cfg.icon}</Text>
          <View style={[styles.crowdBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.crowdLabel, { color: cfg.color }]}>{t(crowdLevel === 'low' ? 'operating' : crowdLevel === 'moderate' ? 'moderate' : 'high')}</Text>
          </View>
          <Text style={styles.crowdSub}>{t('centreStatus')}</Text>
        </View>
      </View>

      {slotTime ? (
        <View style={styles.recRow}>
          <MaterialIcons name="star" size={14} color={Colors.accent} />
          <Text style={styles.recText}>{t('recommendedSlot')}: <Text style={styles.recBold}>{slotTime}</Text></Text>
        </View>
      ) : null}

      {recommendation ? (
        <View style={styles.recRow}>
          <MaterialIcons name="tips-and-updates" size={14} color={Colors.primary} />
          <Text style={styles.recText}>{recommendation}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderTopWidth: 3,
    borderTopColor: Colors.accent,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
  title: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, flex: 1 },
  aiBadge: { backgroundColor: Colors.accent, borderRadius: Radius.pill, paddingHorizontal: 7, paddingVertical: 2 },
  aiBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textOnAccent },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  waitBox: { flex: 1, alignItems: 'center' },
  waitNum: { fontSize: 36, fontWeight: FontWeight.bold, color: Colors.primary },
  waitLbl: { fontSize: FontSize.sm, color: Colors.primary },
  waitSub: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  divider: { width: 1, height: 60, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  crowdBox: { flex: 1, alignItems: 'center', gap: 4 },
  crowdIcon: { fontSize: 24 },
  crowdBadge: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  crowdLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
  crowdSub: { fontSize: FontSize.xs, color: Colors.textMuted },
  recRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  recText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  recBold: { fontWeight: FontWeight.bold, color: Colors.primary },
});
