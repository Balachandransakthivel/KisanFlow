import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { Badge } from '../ui/Badge';
import { getStatusColor, getStatusLabel } from '../../services/procurementService';
import type { SlotBooking } from '../../contexts/ProcurementContext';
import type { QueueStatus } from '../../constants/config';
import { useLang } from '../../contexts/LangContext';

interface TokenCardProps {
  booking: SlotBooking;
  cropName: string;
  quantity: number;
  farmerName?: string;
}

export function TokenCard({ booking, cropName, quantity, farmerName }: TokenCardProps) {
  const { t } = useLang();
  const statusColor = getStatusColor(booking.status as QueueStatus);
  const statusLabel = getStatusLabel(booking.status as QueueStatus, t);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.tokenNum}>{booking.tokenNumber}</Text>
          {farmerName ? <Text style={styles.farmerName}>{farmerName}</Text> : null}
        </View>
        <Badge label={statusLabel} bgColor={statusColor} />
      </View>

      <View style={styles.divider} />

      <View style={styles.grid}>
        <InfoRow icon="grass" label={t('crop')} value={cropName} />
        <InfoRow icon="scale" label={t('weight')} value={`${quantity} kg`} />
        <InfoRow icon="event" label={t('date')} value={booking.date} />
        <InfoRow icon="schedule" label={t('time')} value={booking.timeSlot} />
      </View>

      <View style={styles.queueRow}>
        <View style={styles.queueItem}>
          <Text style={styles.queueNum}>{booking.queuePosition}</Text>
          <Text style={styles.queueLbl}>{t('queuePosition')}</Text>
        </View>
        <View style={styles.queueDivider} />
        <View style={styles.queueItem}>
          <Text style={styles.queueNum}>{Math.max(0, booking.queuePosition - 1)}</Text>
          <Text style={styles.queueLbl}>{t('farmersAhead')}</Text>
        </View>
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon as any} size={16} color={Colors.primary} />
      <Text style={styles.infoLabel}>{label}: </Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  tokenNum: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primaryDark },
  farmerName: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.sm },
  grid: { gap: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, flex: 1 },
  queueRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceTint,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  queueItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm },
  queueNum: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary },
  queueLbl: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  queueDivider: { width: 1, backgroundColor: Colors.border },
});
