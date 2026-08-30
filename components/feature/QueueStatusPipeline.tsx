import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../../constants/theme';
import type { QueueStatus } from '../../constants/config';
import { getStatusColor, getStatusLabel } from '../../services/procurementService';
import { useLang } from '../../contexts/LangContext';

const PIPELINE: QueueStatus[] = [
  'booked', 'arrived', 'called', 'weighment', 'quality_check', 'accepted', 'completed', 'payment_pending', 'paid',
];

interface QueueStatusPipelineProps {
  current: QueueStatus;
}

export function QueueStatusPipeline({ current }: QueueStatusPipelineProps) {
  const { t } = useLang();
  const currentIdx = PIPELINE.indexOf(current);
  if (current === 'rejected') {
    return (
      <View style={styles.rejected}>
        <MaterialIcons name="cancel" size={28} color={Colors.error} />
        <Text style={styles.rejectedText}>{t('rejected')}</Text>
      </View>
    );
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.container}>
      {PIPELINE.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const color = active ? getStatusColor(step) : done ? Colors.success : Colors.border;
        return (
          <View key={step} style={styles.stepWrap}>
            <View style={[styles.dot, { borderColor: color, backgroundColor: done ? Colors.success : active ? color : Colors.surface }]}>
              {done ? (
                <MaterialIcons name="check" size={12} color={Colors.textWhite} />
              ) : (
                <View style={[styles.inner, { backgroundColor: active ? color : Colors.border }]} />
              )}
            </View>
            <Text style={[styles.label, active && { color, fontWeight: FontWeight.bold }]} numberOfLines={1}>
              {getStatusLabel(step, t)}
            </Text>
            {idx < PIPELINE.length - 1 ? (
              <View style={[styles.connector, { backgroundColor: done ? Colors.success : Colors.border }]} />
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginVertical: Spacing.sm },
  container: { paddingHorizontal: Spacing.md, alignItems: 'flex-start', paddingBottom: 4 },
  stepWrap: { alignItems: 'center', position: 'relative', width: 64 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  inner: { width: 10, height: 10, borderRadius: 5 },
  label: { fontSize: 9, color: Colors.textMuted, marginTop: 4, textAlign: 'center', width: 64 },
  connector: {
    position: 'absolute', top: 13, left: 46, width: 18, height: 2,
    backgroundColor: Colors.border,
  },
  rejected: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.sm },
  rejectedText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.error },
});
