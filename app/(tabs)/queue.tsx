import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useLang } from '../../contexts/LangContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProcurement } from '../../contexts/ProcurementContext';
import { CROPS, CENTRES } from '../../constants/config';
import { predictWaitingTime } from '../../services/aiService';
import { getStatusColor, getStatusLabel } from '../../services/procurementService';
import { ScreenHeader, TokenCard, QueueStatusPipeline, AIPredictionCard } from '../../components';
import type { QueueStatus } from '../../constants/config';

export default function QueueScreen() {
  const { t } = useLang();
  const { user } = useAuth();
  const { getBookingsByFarmer, crops, getProcurement } = useProcurement();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const myBookings = getBookingsByFarmer(user?.id || '');
  const activeBooking = myBookings.find(b => !['paid', 'rejected'].includes(b.status));
  const pastBookings = myBookings.filter(b => ['paid', 'rejected', 'completed'].includes(b.status));

  const myCrop = activeBooking ? crops.find(c => c.id === activeBooking.cropRegistrationId) : null;
  const cropInfo = myCrop ? CROPS.find(c => c.id === myCrop.cropId) : null;
  const centre = activeBooking ? CENTRES.find(c => c.id === activeBooking.centreId) : null;

  const aiWait = activeBooking && myCrop ? predictWaitingTime({
    farmersAhead: Math.max(0, activeBooking.queuePosition - 1),
    activeCounters: 3,
    avgProcessingTime: 11,
    quantityKg: myCrop.quantity,
    cropId: myCrop.cropId,
    timeOfDay: 10,
    centreLoad: centre ? centre.status as any : 'normal',
  }) : 0;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title={t('myQueue')} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {activeBooking && myCrop ? (
          <>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live Queue Tracking</Text>
            </View>

            <TokenCard
              booking={activeBooking}
              cropName={`${cropInfo?.icon || '🌾'} ${t(myCrop.cropId)}`}
              quantity={myCrop.quantity}
            />

            <AIPredictionCard
              estimatedWait={aiWait}
              crowdLevel={centre ? centre.status as any : 'normal'}
            />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Procurement Pipeline</Text>
              <QueueStatusPipeline current={activeBooking.status as QueueStatus} />
            </View>

            {/* Notification Alert */}
            {activeBooking.queuePosition <= 5 ? (
              <View style={styles.alertBanner}>
                <Text style={styles.alertIcon}>🔔</Text>
                <View>
                  <Text style={styles.alertTitle}>{t('queueApproaching')}</Text>
                  <Text style={styles.alertSub}>{t('pleaseArrive')}</Text>
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Active Queue</Text>
            <Text style={styles.emptyDesc}>Book a slot to join the procurement queue.</Text>
          </View>
        )}

        {pastBookings.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Past Bookings</Text>
            {pastBookings.map(b => {
              const c = crops.find(cr => cr.id === b.cropRegistrationId);
              const ci = c ? CROPS.find(x => x.id === c.cropId) : null;
              return (
                <View key={b.id} style={styles.pastRow}>
                  <Text style={styles.pastIcon}>{ci?.icon || '🌾'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pastToken}>{b.tokenNumber}</Text>
                    <Text style={styles.pastDate}>{b.date} · {b.timeSlot}</Text>
                  </View>
                  <View style={[styles.pastBadge, { backgroundColor: `${getStatusColor(b.status as QueueStatus)}22` }]}>
                    <Text style={[styles.pastBadgeText, { color: getStatusColor(b.status as QueueStatus) }]}>
                      {getStatusLabel(b.status as QueueStatus, t)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.md, gap: Spacing.md },
  liveTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success,
  },
  liveText: { fontSize: FontSize.sm, color: Colors.success, fontWeight: FontWeight.semiBold },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, ...Shadow.sm,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  alertBanner: {
    flexDirection: 'row', gap: Spacing.md, alignItems: 'center',
    backgroundColor: Colors.warningLight, borderRadius: Radius.lg, padding: Spacing.md,
    borderLeftWidth: 4, borderLeftColor: Colors.warning,
  },
  alertIcon: { fontSize: 28 },
  alertTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.warning },
  alertSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { fontSize: 56, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptyDesc: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  pastRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  pastIcon: { fontSize: 22 },
  pastToken: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  pastDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  pastBadge: { borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  pastBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semiBold },
});
