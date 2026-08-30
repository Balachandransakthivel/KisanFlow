import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useLang } from '../../contexts/LangContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProcurement } from '../../contexts/ProcurementContext';
import { CENTRES, CROPS } from '../../constants/config';
import { getStatusColor, getStatusLabel } from '../../services/procurementService';
import { predictWaitingTime } from '../../services/aiService';
import { Badge, StatCard, SectionHeader, TokenCard, AIPredictionCard } from '../../components';
import type { QueueStatus } from '../../constants/config';

export default function FarmerHomeScreen() {
  const { t } = useLang();
  const { user } = useAuth();
  const { getBookingsByFarmer, crops, getProcurement } = useProcurement();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const myBookings = getBookingsByFarmer(user?.id || '');
  const activeBooking = myBookings.find(b => !['paid', 'rejected'].includes(b.status));
  const completedCount = myBookings.filter(b => b.status === 'paid').length;

  const myCrop = activeBooking
    ? crops.find(c => c.id === activeBooking.cropRegistrationId)
    : null;
  const cropInfo = myCrop ? CROPS.find(c => c.id === myCrop.cropId) : null;
  const centre = user?.centreId ? CENTRES.find(c => c.id === user.centreId) : null;

  const aiWait = activeBooking ? predictWaitingTime({
    farmersAhead: Math.max(0, activeBooking.queuePosition - 1),
    activeCounters: 3,
    avgProcessingTime: 11,
    quantityKg: myCrop?.quantity || 700,
    cropId: myCrop?.cropId || 'paddy',
    timeOfDay: 10,
    centreLoad: centre ? centre.status as any : 'normal',
  }) : 0;

  const quickActions = [
    { icon: 'event-available', label: t('bookSlot'), route: '/(tabs)/book', color: Colors.primary },
    { icon: 'queue', label: t('myQueue'), route: '/(tabs)/queue', color: Colors.info },
    { icon: 'payments', label: t('payments'), route: '/(tabs)/payments', color: Colors.success },
    { icon: 'person', label: t('profile'), route: '/profile', color: Colors.accentDark },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>🌾 {t('appName')}</Text>
            <Text style={styles.farmerName}>{user?.name || 'Farmer'}</Text>
            <Text style={styles.farmerId}>{user?.farmerId}</Text>
          </View>
          <Pressable onPress={() => router.push('/profile')} style={styles.avatarBtn}>
            <Text style={styles.avatarText}>{(user?.name || 'F')[0].toUpperCase()}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label={t('myBookings')} value={myBookings.length} icon="📋" accent={Colors.primary} />
          <StatCard label={t('completed')} value={completedCount} icon="✅" accent={Colors.success} />
          <StatCard label={t('processing')} value={myBookings.filter(b => !['paid', 'rejected', 'booked'].includes(b.status)).length} icon="⚙️" accent={Colors.warning} />
        </View>

        {/* Active Token */}
        {activeBooking && myCrop ? (
          <View style={{ paddingHorizontal: Spacing.md }}>
            <SectionHeader title={t('yourToken')} />
            <TokenCard
              booking={activeBooking}
              cropName={`${cropInfo?.icon || '🌾'} ${t(myCrop.cropId)}`}
              quantity={myCrop.quantity}
            />
          </View>
        ) : (
          <View style={[styles.emptyToken, { marginHorizontal: Spacing.md }]}>
            <Text style={styles.emptyIcon}>🎫</Text>
            <Text style={styles.emptyText}>No active booking</Text>
            <Pressable onPress={() => router.push('/(tabs)/book')} style={styles.bookBtn}>
              <Text style={styles.bookBtnText}>{t('bookSlot')} →</Text>
            </Pressable>
          </View>
        )}

        {/* AI Prediction */}
        {activeBooking ? (
          <View style={{ paddingHorizontal: Spacing.md, marginTop: Spacing.md }}>
            <SectionHeader title={t('aiPrediction')} />
            <AIPredictionCard
              estimatedWait={aiWait}
              crowdLevel={centre ? centre.status as any : 'normal'}
              recommendation={
                aiWait > 40
                  ? 'High wait detected. Consider arriving after 2 PM for shorter queue.'
                  : 'Good time to arrive at the centre.'
              }
            />
          </View>
        ) : null}

        {/* Centre Status */}
        {centre ? (
          <View style={{ paddingHorizontal: Spacing.md, marginTop: Spacing.md }}>
            <SectionHeader title={t('centreStatus')} />
            <View style={[styles.centreCard, Shadow.sm]}>
              <View style={styles.centreTop}>
                <Text style={styles.centreName}>{centre.name}</Text>
                <Badge
                  label={centre.status === 'normal' ? t('operating') : centre.status === 'moderate' ? t('moderate') : t('high')}
                  bgColor={centre.status === 'normal' ? Colors.successLight : centre.status === 'moderate' ? Colors.warningLight : Colors.errorLight}
                  color={centre.status === 'normal' ? Colors.success : centre.status === 'moderate' ? Colors.warning : Colors.error}
                />
              </View>
              <View style={styles.centreStats}>
                <CentreStat icon="people" value={centre.waitingCount} label={t('waitingFarmers')} />
                <CentreStat icon="sync" value={centre.processingCount} label={t('processingNow')} />
                <CentreStat icon="check-circle" value={centre.completedToday} label={t('completedToday')} />
              </View>
            </View>
          </View>
        ) : null}

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: Spacing.md, marginTop: Spacing.md }}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.actionsGrid}>
            {quickActions.map(a => (
              <Pressable
                key={a.route}
                onPress={() => router.push(a.route as any)}
                style={({ pressed }) => [styles.actionBtn, { borderTopColor: a.color }, pressed && styles.pressed]}
              >
                <MaterialIcons name={a.icon as any} size={28} color={a.color} />
                <Text style={styles.actionLabel}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function CentreStat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <View style={styles.cStat}>
      <MaterialIcons name={icon as any} size={18} color={Colors.primary} />
      <Text style={styles.cStatNum}>{value}</Text>
      <Text style={styles.cStatLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: Colors.accentLight, fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, letterSpacing: 1 },
  farmerName: { color: Colors.textWhite, fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginTop: 2 },
  farmerId: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, marginTop: 2 },
  avatarBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textOnAccent },
  scroll: { paddingTop: Spacing.md },
  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.sm, marginBottom: Spacing.sm },
  emptyToken: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.xl,
    alignItems: 'center', ...Shadow.sm,
  },
  emptyIcon: { fontSize: 40, marginBottom: Spacing.sm },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.md },
  bookBtn: { backgroundColor: Colors.primary, borderRadius: Radius.pill, paddingHorizontal: 20, paddingVertical: 10 },
  bookBtnText: { color: Colors.textWhite, fontWeight: FontWeight.semiBold },
  centreCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md,
  },
  centreTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  centreName: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, marginRight: 8 },
  centreStats: { flexDirection: 'row', justifyContent: 'space-around' },
  cStat: { alignItems: 'center', gap: 2 },
  cStatNum: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cStatLbl: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionBtn: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', gap: 8,
    borderTopWidth: 3, ...Shadow.sm,
  },
  actionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  pressed: { opacity: 0.8 },
});
