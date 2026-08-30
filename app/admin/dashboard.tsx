import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useLang } from '../../contexts/LangContext';
import { useAuth } from '../../contexts/AuthContext';
import { CENTRES } from '../../constants/config';
import { predictCrowding, predictWaitingTime } from '../../services/aiService';
import { ScreenHeader, StatCard, Badge } from '../../components';

const { width } = Dimensions.get('window');

const ANALYTICS_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FARMER_COUNTS = [450, 620, 380, 710, 580, 490, 320];
const MAX_VAL = Math.max(...FARMER_COUNTS);

export default function AdminDashboard() {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedCentre, setSelectedCentre] = useState<string | null>(null);

  const totalFarmers = 12840;
  const todayBookings = 840;
  const processed = 692;
  const activeCentres = CENTRES.filter(c => c.status !== 'closed').length;
  const congested = CENTRES.filter(c => c.status === 'high').length;

  const avgWait = Math.round(CENTRES.reduce((s, c) => {
    const pred = predictWaitingTime({ farmersAhead: c.waitingCount, activeCounters: 3, avgProcessingTime: 11, quantityKg: 700, cropId: 'paddy', timeOfDay: 10, centreLoad: c.status as any });
    return s + pred;
  }, 0) / CENTRES.length);

  const CENTRE_STATUS_COLORS = {
    normal: Colors.success,
    moderate: Colors.warning,
    high: Colors.error,
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader
        title="Admin Dashboard"
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
        {/* System Overview */}
        <Text style={styles.sectionTitle}>System Overview · Tamil Nadu</Text>
        <View style={styles.statsRow}>
          <StatCard label="Total Farmers" value={totalFarmers.toLocaleString()} icon="👨‍🌾" accent={Colors.primary} />
          <StatCard label="Today's Bookings" value={todayBookings} icon="📋" accent={Colors.info} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Processed" value={processed} icon="✅" accent={Colors.success} />
          <StatCard label="Active Centres" value={activeCentres} icon="🏢" accent={Colors.primaryLight} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label="Congested" value={congested} icon="🔴" accent={Colors.error} />
          <StatCard label="Avg Wait" value={`${avgWait}m`} icon="⏱️" accent={Colors.warning} />
        </View>

        {/* Procurement Analytics Chart */}
        <Text style={styles.sectionTitle}>Weekly Procurement Volume</Text>
        <View style={[styles.card, Shadow.sm]}>
          <View style={styles.chartArea}>
            {ANALYTICS_DAYS.map((day, i) => {
              const barH = Math.max(8, (FARMER_COUNTS[i] / MAX_VAL) * 100);
              return (
                <View key={day} style={styles.barWrap}>
                  <Text style={styles.barVal}>{FARMER_COUNTS[i]}</Text>
                  <View style={[styles.bar, { height: barH }]} />
                  <Text style={styles.barDay}>{day}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.chartLegend}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Farmers processed per day</Text>
          </View>
        </View>

        {/* Before/After */}
        <Text style={styles.sectionTitle}>System Impact</Text>
        <View style={[styles.card, Shadow.sm]}>
          <View style={styles.impactRow}>
            <ImpactItem label="Avg Wait Before" value="2h 10m" color={Colors.error} icon="hourglass-full" />
            <MaterialIcons name="arrow-forward" size={24} color={Colors.textMuted} />
            <ImpactItem label="Avg Wait After" value={`${avgWait}m`} color={Colors.success} icon="hourglass-empty" />
          </View>
          <View style={styles.impactRow}>
            <ImpactItem label="Physical Queue" value="100%" color={Colors.error} icon="people" />
            <MaterialIcons name="arrow-forward" size={24} color={Colors.textMuted} />
            <ImpactItem label="Digital Queue" value="100%" color={Colors.success} icon="phone-android" />
          </View>
        </View>

        {/* Live Centre Map */}
        <Text style={styles.sectionTitle}>{t('centreMap')} — Live Status</Text>
        {CENTRES.map(centre => {
          const crowding = predictCrowding(centre.id, new Date().getHours());
          const statusColor = CENTRE_STATUS_COLORS[centre.status as keyof typeof CENTRE_STATUS_COLORS];
          const isSelected = selectedCentre === centre.id;

          return (
            <Pressable
              key={centre.id}
              onPress={() => setSelectedCentre(isSelected ? null : centre.id)}
              style={[styles.centreCard, Shadow.sm, isSelected && styles.centreCardActive]}
            >
              <View style={styles.centreTop}>
                <View style={[styles.centreStatusDot, { backgroundColor: statusColor }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.centreName}>{centre.name}</Text>
                  <Text style={styles.centreDistrict}>{centre.district}</Text>
                </View>
                <Badge
                  label={centre.status === 'normal' ? t('operating') : centre.status === 'moderate' ? t('moderate') : t('high')}
                  bgColor={`${statusColor}22`}
                  color={statusColor}
                  size="sm"
                />
              </View>

              {isSelected ? (
                <View style={styles.centreDetails}>
                  <View style={styles.centreStats}>
                    <CentreStat icon="people" value={centre.waitingCount} label={t('waitingFarmers')} />
                    <CentreStat icon="sync" value={centre.processingCount} label={t('processingNow')} />
                    <CentreStat icon="check-circle" value={centre.completedToday} label={t('completedToday')} />
                  </View>
                  <View style={styles.aiRow}>
                    <MaterialIcons name="psychology" size={14} color={Colors.accent} />
                    <Text style={styles.aiText}>AI: {crowding.recommendation}</Text>
                  </View>
                </View>
              ) : null}
            </Pressable>
          );
        })}

        {/* Exception Alerts */}
        <Text style={styles.sectionTitle}>System Alerts</Text>
        {CENTRES.filter(c => c.status === 'high').map(c => (
          <View key={c.id} style={styles.alertCard}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>HIGH CONGESTION — {c.name}</Text>
              <Text style={styles.alertText}>
                {c.waitingCount} farmers waiting. Consider activating overflow protocol or redirecting farmers.
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ImpactItem({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <View style={styles.impactItem}>
      <MaterialIcons name={icon as any} size={22} color={color} />
      <Text style={[styles.impactValue, { color }]}>{value}</Text>
      <Text style={styles.impactLabel}>{label}</Text>
    </View>
  );
}

function CentreStat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <MaterialIcons name={icon as any} size={16} color={Colors.primary} />
      <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>{value}</Text>
      <Text style={{ fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.md, gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: 4 },
  statsRow: { flexDirection: 'row' },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, marginBottom: Spacing.sm },
  barWrap: { alignItems: 'center', flex: 1, gap: 4 },
  bar: { width: '70%', backgroundColor: Colors.primary, borderRadius: 4, minHeight: 8 },
  barVal: { fontSize: 9, color: Colors.textMuted },
  barDay: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  chartLegend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  impactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  impactItem: { alignItems: 'center', gap: 4 },
  impactValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  impactLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
  centreCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md },
  centreCardActive: { borderWidth: 1.5, borderColor: Colors.primary },
  centreTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  centreStatusDot: { width: 12, height: 12, borderRadius: 6 },
  centreName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  centreDistrict: { fontSize: FontSize.xs, color: Colors.textMuted },
  centreDetails: { marginTop: Spacing.sm, gap: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.divider },
  centreStats: { flexDirection: 'row', justifyContent: 'space-around' },
  aiRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  aiText: { fontSize: FontSize.xs, color: Colors.textSecondary, flex: 1 },
  alertCard: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
    backgroundColor: Colors.errorLight, borderRadius: Radius.md, padding: Spacing.md,
    borderLeftWidth: 4, borderLeftColor: Colors.error,
  },
  alertIcon: { fontSize: 22 },
  alertTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.error },
  alertText: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});
