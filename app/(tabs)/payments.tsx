import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useLang } from '../../contexts/LangContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProcurement } from '../../contexts/ProcurementContext';
import { CROPS } from '../../constants/config';
import { formatCurrency, formatDate } from '../../services/procurementService';
import { ScreenHeader, PaymentTracker } from '../../components';

export default function PaymentsScreen() {
  const { t } = useLang();
  const { user } = useAuth();
  const { getBookingsByFarmer, crops, getProcurement } = useProcurement();
  const insets = useSafeAreaInsets();

  const myBookings = getBookingsByFarmer(user?.id || '');
  const paymentsData = myBookings.map(b => {
    const proc = getProcurement(b.id);
    const crop = crops.find(c => c.id === b.cropRegistrationId);
    const cropInfo = crop ? CROPS.find(ci => ci.id === crop.cropId) : null;
    return { booking: b, proc, crop, cropInfo };
  }).filter(d => d.proc?.payment || ['accepted', 'completed', 'payment_pending', 'paid'].includes(d.booking.status));

  const totalEarned = paymentsData
    .filter(d => d.proc?.payment?.status === 'credited')
    .reduce((sum, d) => sum + (d.proc?.payment?.amount || 0), 0);

  const totalPending = paymentsData
    .filter(d => d.proc?.payment && d.proc.payment.status !== 'credited')
    .reduce((sum, d) => sum + (d.proc?.payment?.amount || 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title={t('payments')} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={[styles.summaryCard, Shadow.md]}>
          <View style={styles.summaryItem}>
            <MaterialIcons name="account-balance-wallet" size={28} color={Colors.success} />
            <Text style={styles.summaryValue}>{formatCurrency(totalEarned)}</Text>
            <Text style={styles.summaryLabel}>Credited</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <MaterialIcons name="pending" size={28} color={Colors.warning} />
            <Text style={[styles.summaryValue, { color: Colors.warning }]}>{formatCurrency(totalPending)}</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>

        {paymentsData.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyTitle}>No Payment Records</Text>
            <Text style={styles.emptyDesc}>Your payment history will appear here after crop procurement.</Text>
          </View>
        ) : (
          paymentsData.map(({ booking, proc, crop, cropInfo }) => (
            <View key={booking.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.tokenLabel}>{booking.tokenNumber}</Text>
                <Text style={styles.cropLabel}>{cropInfo?.icon} {crop ? t(crop.cropId) : '-'} · {crop?.quantity} kg</Text>
              </View>
              {proc?.payment ? (
                <PaymentTracker payment={proc.payment} />
              ) : (
                <View style={styles.noPayCard}>
                  <MaterialIcons name="hourglass-empty" size={24} color={Colors.textMuted} />
                  <Text style={styles.noPayText}>Payment will be initiated after procurement is completed.</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.md, gap: Spacing.md },
  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg,
    flexDirection: 'row', alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.success },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryDivider: { width: 1, height: 60, backgroundColor: Colors.border },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptyDesc: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginTop: 4, maxWidth: 260 },
  section: { gap: Spacing.sm },
  sectionHeader: { paddingHorizontal: 4 },
  tokenLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cropLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  noPayCard: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'center',
    backgroundColor: Colors.surfaceTint, borderRadius: Radius.md, padding: Spacing.md,
  },
  noPayText: { flex: 1, fontSize: FontSize.sm, color: Colors.textMuted },
});
