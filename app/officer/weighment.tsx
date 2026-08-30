import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useLang } from '../../contexts/LangContext';
import { useProcurement } from '../../contexts/ProcurementContext';
import { useAlert } from '@/template';
import { CROPS, QUALITY_THRESHOLDS } from '../../constants/config';
import { generateProcurementId, formatCurrency } from '../../services/procurementService';
import { ScreenHeader, InputField, KButton } from '../../components';

type Tab = 'weighment' | 'quality' | 'receipt';

export default function WeighmentScreen() {
  const { t } = useLang();
  const { bookingId, farmerName, cropName, quantity } = useLocalSearchParams<{
    bookingId: string; farmerName: string; cropName: string; quantity: string;
  }>();
  const { recordWeighment, recordQuality, updatePayment, updateBookingStatus, getProcurement, bookings } = useProcurement();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('weighment');

  const booking = bookings.find(b => b.id === bookingId);
  const procurement = getProcurement(bookingId || '');
  const cropInfo = CROPS.find(c => c.id === cropName);
  const thresholds = QUALITY_THRESHOLDS[cropName || 'paddy'];

  // Weighment
  const [gross, setGross] = useState(procurement?.weighment?.grossWeight?.toString() || '');
  const [tare, setTare] = useState(procurement?.weighment?.tareWeight?.toString() || '70');
  const net = gross && tare ? Math.max(0, Number(gross) - Number(tare)) : 0;

  // Quality
  const [moisture, setMoisture] = useState('');
  const [foreign, setForeign] = useState('');
  const [damaged, setDamaged] = useState('');
  const qualityResult = moisture && foreign && damaged
    ? (Number(moisture) <= thresholds.moisture && Number(foreign) <= thresholds.foreignMatter && Number(damaged) <= thresholds.damagedGrain)
      ? 'accepted' : 'rejected'
    : null;

  const TABS: Tab[] = ['weighment', 'quality', 'receipt'];

  const handleSaveWeighment = () => {
    if (!gross) { showAlert('Error', 'Enter gross weight.'); return; }
    recordWeighment(bookingId || '', {
      grossWeight: Number(gross), tareWeight: Number(tare), netWeight: net,
      recordedAt: new Date().toISOString(),
    });
    updateBookingStatus(bookingId || '', 'weighment');
    showAlert('Saved', `Net Weight: ${net} kg recorded.`);
    setTab('quality');
  };

  const handleSaveQuality = () => {
    if (!moisture || !foreign || !damaged) { showAlert('Error', 'Fill all quality parameters.'); return; }
    const result = qualityResult || 'rejected';
    const grade = result === 'accepted' ? 'A' : 'C';
    recordQuality(bookingId || '', {
      moisture: Number(moisture), foreignMatter: Number(foreign),
      damagedGrain: Number(damaged), grade, result,
      checkedAt: new Date().toISOString(),
    });
    updateBookingStatus(bookingId || '', result === 'accepted' ? 'accepted' : 'rejected');
    if (result === 'accepted') {
      updatePayment(bookingId || '', 'pending');
      showAlert('Quality Accepted', `Grade A — Proceeding to procurement.`);
      setTab('receipt');
    } else {
      showAlert('Quality Rejected', `Parameters exceeded thresholds. Farmer notified.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const handleCompletePayment = () => {
    updatePayment(bookingId || '', 'bill_generated');
    updateBookingStatus(bookingId || '', 'payment_pending');
    const procId = generateProcurementId();
    showAlert('Procurement Complete', `ID: ${procId}\nPayment bill generated. Amount: ${formatCurrency(net * (cropInfo?.mspRate || 2183))}`, [
      { text: 'Done', onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <ScreenHeader title="Procurement Details" showBack />

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map(tb => (
            <View
              key={tb}
              style={[styles.tab, tab === tb && styles.tabActive]}
            >
              <Text
                style={[styles.tabText, tab === tb && styles.tabTextActive]}
                onPress={() => setTab(tb)}
              >
                {tb === 'weighment' ? t('weighment') : tb === 'quality' ? t('qualityCheck') : t('procurementReceipt')}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Farmer Info */}
          <View style={styles.farmerInfo}>
            <Text style={styles.farmerName}>{farmerName}</Text>
            <Text style={styles.farmerDetail}>{cropInfo?.icon} {t(cropName || 'paddy')} · {quantity} kg</Text>
            {booking ? <Text style={styles.tokenText}>{booking.tokenNumber}</Text> : null}
          </View>

          {/* Weighment Tab */}
          {tab === 'weighment' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('weighment')}</Text>
              <InputField label={`${t('grossWeight')} (kg)`} value={gross} onChangeText={setGross} keyboardType="decimal-pad" placeholder="e.g. 920" />
              <InputField label={`${t('tare')} (kg)`} value={tare} onChangeText={setTare} keyboardType="decimal-pad" />

              {net > 0 ? (
                <View style={styles.netCard}>
                  <Text style={styles.netLabel}>{t('netWeight')}</Text>
                  <Text style={styles.netValue}>{net} kg</Text>
                  <Text style={styles.netEstimate}>
                    Estimated: {formatCurrency(net * (cropInfo?.mspRate || 2183))} @ ₹{cropInfo?.mspRate}/kg
                  </Text>
                </View>
              ) : null}

              <KButton label="Save & Next" onPress={handleSaveWeighment} fullWidth />
            </View>
          ) : null}

          {/* Quality Tab */}
          {tab === 'quality' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('qualityCheck')}</Text>

              {/* Thresholds */}
              <View style={styles.thresholdBox}>
                <Text style={styles.thresholdTitle}>Permitted Thresholds ({t(cropName || 'paddy')})</Text>
                <Text style={styles.thresholdRow}>Moisture: ≤ {thresholds.moisture}%</Text>
                <Text style={styles.thresholdRow}>Foreign Matter: ≤ {thresholds.foreignMatter}%</Text>
                <Text style={styles.thresholdRow}>Damaged Grain: ≤ {thresholds.damagedGrain}%</Text>
              </View>

              <InputField label={t('moisture')} value={moisture} onChangeText={setMoisture} keyboardType="decimal-pad" placeholder={`≤ ${thresholds.moisture}`} />
              <InputField label={t('foreignMatter')} value={foreign} onChangeText={setForeign} keyboardType="decimal-pad" placeholder={`≤ ${thresholds.foreignMatter}`} />
              <InputField label={t('damagedGrain')} value={damaged} onChangeText={setDamaged} keyboardType="decimal-pad" placeholder={`≤ ${thresholds.damagedGrain}`} />

              {qualityResult ? (
                <View style={[styles.qualityResult, qualityResult === 'accepted' ? styles.accepted : styles.rejected]}>
                  <Text style={styles.qualityResultIcon}>{qualityResult === 'accepted' ? '✅' : '⚠️'}</Text>
                  <Text style={styles.qualityResultText}>
                    {qualityResult === 'accepted' ? t('accepted') : t('rejected')}
                  </Text>
                </View>
              ) : null}

              <KButton label={t('submitQuality')} onPress={handleSaveQuality} fullWidth />
            </View>
          ) : null}

          {/* Receipt Tab */}
          {tab === 'receipt' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('procurementReceipt')}</Text>
              <View style={styles.receiptBox}>
                <ReceiptRow label="Farmer" value={farmerName || '-'} />
                <ReceiptRow label={t('crop')} value={`${cropInfo?.icon || ''} ${t(cropName || 'paddy')}`} />
                <ReceiptRow label={t('grossWeight')} value={`${procurement?.weighment?.grossWeight || gross} kg`} />
                <ReceiptRow label={t('tare')} value={`${procurement?.weighment?.tareWeight || tare} kg`} />
                <ReceiptRow label={t('netWeight')} value={`${procurement?.weighment?.netWeight || net} kg`} bold />
                <ReceiptRow label="MSP Rate" value={`₹${cropInfo?.mspRate}/kg`} />
                <ReceiptRow label={t('estimatedValue')} value={formatCurrency((procurement?.weighment?.netWeight || net) * (cropInfo?.mspRate || 2183))} bold accent />
                <ReceiptRow label={t('qualityGrade')} value={procurement?.quality?.grade || 'A'} />
                <ReceiptRow label={t('status')} value={t('accepted')} />
              </View>
              <KButton label={t('completeProcurement')} onPress={handleCompletePayment} fullWidth style={{ marginTop: Spacing.md }} />
            </View>
          ) : null}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function ReceiptRow({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={[styles.receiptValue, bold && styles.bold, accent && styles.accentText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.md, gap: Spacing.md },
  tabRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
  tabActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  tabText: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: FontWeight.medium, textAlign: 'center' },
  tabTextActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  farmerInfo: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.md },
  farmerName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textWhite },
  farmerDetail: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  tokenText: { fontSize: FontSize.xs, color: Colors.accentLight, marginTop: 4 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.sm },
  cardTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  netCard: {
    backgroundColor: Colors.surfaceTint, borderRadius: Radius.md, padding: Spacing.md,
    alignItems: 'center', marginBottom: Spacing.md,
  },
  netLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  netValue: { fontSize: 40, fontWeight: FontWeight.bold, color: Colors.primary },
  netEstimate: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  thresholdBox: { backgroundColor: Colors.infoLight, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  thresholdTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.info, marginBottom: 4 },
  thresholdRow: { fontSize: FontSize.sm, color: Colors.info },
  qualityResult: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'center',
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md,
  },
  accepted: { backgroundColor: Colors.successLight },
  rejected: { backgroundColor: Colors.errorLight },
  qualityResultIcon: { fontSize: 24 },
  qualityResultText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  receiptBox: { backgroundColor: Colors.surfaceTint, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  receiptLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  receiptValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  bold: { fontWeight: FontWeight.bold, fontSize: FontSize.md },
  accentText: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
});
