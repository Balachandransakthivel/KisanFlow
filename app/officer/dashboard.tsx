import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useLang } from '../../contexts/LangContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProcurement, MOCK_FARMER_NAMES } from '../../contexts/ProcurementContext';
import { CROPS } from '../../constants/config';
import { getStatusColor, getStatusLabel } from '../../services/procurementService';
import { predictCrowding } from '../../services/aiService';
import { ScreenHeader, StatCard, Badge } from '../../components';
import type { QueueStatus } from '../../constants/config';
import type { SlotBooking } from '../../contexts/ProcurementContext';

const STATUS_FILTERS: Array<QueueStatus | 'all'> = ['all', 'arrived', 'waiting', 'called', 'weighment', 'quality_check', 'accepted', 'completed', 'payment_pending'];

export default function OfficerDashboard() {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const { getBookingsByCentre, crops, updateBookingStatus } = useProcurement();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<QueueStatus | 'all'>('all');

  const centreId = user?.centreId || 'c2';
  const allBookings = getBookingsByCentre(centreId);

  const waiting = allBookings.filter(b => ['arrived', 'waiting', 'called'].includes(b.status)).length;
  const processing = allBookings.filter(b => ['weighment', 'quality_check'].includes(b.status)).length;
  const completed = allBookings.filter(b => ['accepted', 'completed', 'paid'].includes(b.status)).length;

  const filtered = filter === 'all' ? allBookings : allBookings.filter(b => b.status === filter);
  const crowding = predictCrowding(centreId, new Date().getHours());

  const FARMER_MOCK_DATA: Record<string, { name: string; crop: string; quantity: number }> = {
    f002: { name: 'Arun Kumar', crop: 'paddy', quantity: 720 },
    f003: { name: 'Selvam R', crop: 'paddy', quantity: 850 },
    f004: { name: 'Priya M', crop: 'wheat', quantity: 600 },
    f005: { name: 'Bala S', crop: 'maize', quantity: 480 },
    f006: { name: 'Ravi T', crop: 'paddy', quantity: 900 },
    f007: { name: 'Mani V', crop: 'cotton', quantity: 320 },
    f008: { name: 'Gopi K', crop: 'paddy', quantity: 760 },
    f009: { name: 'Vijay N', crop: 'groundnut', quantity: 540 },
    f010: { name: 'Murugan P', crop: 'paddy', quantity: 680 },
    f011: { name: 'Kannan L', crop: 'wheat', quantity: 420 },
    f001: { name: 'Ramesh Kumar', crop: 'paddy', quantity: 850 },
  };

  const getNextStatus = (current: QueueStatus): QueueStatus | null => {
    const map: Partial<Record<QueueStatus, QueueStatus>> = {
      booked: 'arrived', arrived: 'waiting', waiting: 'called',
      called: 'weighment', weighment: 'quality_check',
      quality_check: 'accepted', accepted: 'completed',
      completed: 'payment_pending', payment_pending: 'paid',
    };
    return map[current] || null;
  };

  const handleAdvance = (booking: SlotBooking) => {
    const next = getNextStatus(booking.status as QueueStatus);
    if (next) updateBookingStatus(booking.id, next);
  };

  const handleReject = (booking: SlotBooking) => {
    updateBookingStatus(booking.id, 'rejected');
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader
        title="Officer Dashboard"
        dark
        right={
          <Pressable onPress={() => { logout(); router.replace('/login'); }} style={styles.logoutBtn}>
            <MaterialIcons name="logout" size={20} color={Colors.textWhite} />
          </Pressable>
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label={t('waitingFarmers')} value={waiting} icon="⏳" accent={Colors.warning} />
          <StatCard label={t('processingNow')} value={processing} icon="⚙️" accent={Colors.info} />
          <StatCard label={t('completedToday')} value={completed} icon="✅" accent={Colors.success} />
        </View>

        {/* AI Crowd Alert */}
        <View style={[styles.crowdCard, {
          backgroundColor: crowding.risk === 'high' ? Colors.errorLight : crowding.risk === 'moderate' ? Colors.warningLight : Colors.successLight,
          borderLeftColor: crowding.risk === 'high' ? Colors.error : crowding.risk === 'moderate' ? Colors.warning : Colors.success,
        }]}>
          <MaterialIcons name="psychology" size={20} color={crowding.risk === 'high' ? Colors.error : crowding.risk === 'moderate' ? Colors.warning : Colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.crowdTitle}>AI Crowd Prediction</Text>
            <Text style={styles.crowdText}>{crowding.recommendation}</Text>
          </View>
          <Badge
            label={crowding.risk.toUpperCase()}
            bgColor={crowding.risk === 'high' ? Colors.error : crowding.risk === 'moderate' ? Colors.warning : Colors.success}
          />
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {STATUS_FILTERS.map(s => (
              <Pressable
                key={s}
                onPress={() => setFilter(s)}
                style={[styles.filterChip, filter === s && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, filter === s && styles.filterTextActive]}>
                  {s === 'all' ? 'All' : getStatusLabel(s, t)}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Farmer Queue */}
        <Text style={styles.sectionTitle}>{t('nowServing')} ({filtered.length})</Text>
        {filtered.map(booking => {
          const fd = FARMER_MOCK_DATA[booking.farmerId] || { name: `Farmer ${booking.farmerId}`, crop: 'paddy', quantity: 700 };
          const cropInfo = CROPS.find(c => c.id === fd.crop);
          const statusColor = getStatusColor(booking.status as QueueStatus);
          const nextStatus = getNextStatus(booking.status as QueueStatus);

          return (
            <View key={booking.id} style={[styles.farmerCard, Shadow.sm]}>
              <View style={styles.farmerTop}>
                <View style={styles.farmerAvatar}>
                  <Text style={styles.farmerAvatarText}>{fd.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.farmerName}>{fd.name}</Text>
                  <Text style={styles.farmerToken}>{booking.tokenNumber}</Text>
                  <Text style={styles.farmerCrop}>{cropInfo?.icon} {t(fd.crop)} · {fd.quantity} kg</Text>
                </View>
                <Badge label={getStatusLabel(booking.status as QueueStatus, t)} bgColor={statusColor} size="sm" />
              </View>

              <View style={styles.actionRow}>
                {booking.status === 'quality_check' ? (
                  <>
                    <Pressable
                      onPress={() => handleReject(booking)}
                      style={[styles.actionBtn, styles.rejectBtn]}
                    >
                      <MaterialIcons name="cancel" size={16} color={Colors.error} />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleAdvance(booking)}
                      style={[styles.actionBtn, styles.advanceBtn]}
                    >
                      <MaterialIcons name="check-circle" size={16} color={Colors.textWhite} />
                      <Text style={styles.advanceBtnText}>{t('accepted')}</Text>
                    </Pressable>
                  </>
                ) : nextStatus ? (
                  <Pressable
                    onPress={() => handleAdvance(booking)}
                    style={[styles.actionBtn, styles.advanceBtn, { flex: 1 }]}
                  >
                    <MaterialIcons name="arrow-forward" size={16} color={Colors.textWhite} />
                    <Text style={styles.advanceBtnText}>
                      {nextStatus === 'arrived' ? t('markArrived')
                        : nextStatus === 'weighment' ? t('startWeighment')
                        : nextStatus === 'quality_check' ? t('submitQuality')
                        : nextStatus === 'paid' ? t('updatePayment')
                        : `→ ${getStatusLabel(nextStatus, t)}`}
                    </Text>
                  </Pressable>
                ) : booking.status === 'paid' ? (
                  <View style={styles.paidTag}>
                    <MaterialIcons name="check-circle" size={16} color={Colors.success} />
                    <Text style={styles.paidTagText}>Completed & Paid</Text>
                  </View>
                ) : null}

                {booking.status !== 'rejected' && booking.status !== 'paid' ? (
                  <Pressable
                    onPress={() => router.push({ pathname: '/officer/weighment', params: { bookingId: booking.id, farmerName: fd.name, cropName: fd.crop, quantity: fd.quantity } })}
                    style={styles.detailBtn}
                  >
                    <MaterialIcons name="info" size={18} color={Colors.primary} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.md, gap: Spacing.md },
  statsRow: { flexDirection: 'row' },
  crowdCard: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'center',
    borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 4,
  },
  crowdTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  crowdText: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  filterScroll: { marginVertical: -4 },
  filterRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.pill, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterTextActive: { color: Colors.textWhite, fontWeight: FontWeight.bold },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  farmerCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md,
    gap: Spacing.sm,
  },
  farmerTop: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start' },
  farmerAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surfaceTint, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.border,
  },
  farmerAvatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  farmerName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  farmerToken: { fontSize: FontSize.xs, color: Colors.textMuted },
  farmerCrop: { fontSize: FontSize.sm, color: Colors.textSecondary },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  actionBtn: {
    flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: Radius.md,
  },
  advanceBtn: { backgroundColor: Colors.primary },
  advanceBtnText: { color: Colors.textWhite, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm },
  rejectBtn: { borderWidth: 1.5, borderColor: Colors.error, backgroundColor: Colors.errorLight },
  rejectBtnText: { color: Colors.error, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm },
  paidTag: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  paidTagText: { color: Colors.success, fontWeight: FontWeight.semiBold, fontSize: FontSize.sm },
  detailBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceTint, alignItems: 'center', justifyContent: 'center',
  },
  logoutBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});
