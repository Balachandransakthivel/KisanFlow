import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useLang } from '../../contexts/LangContext';
import { useAuth } from '../../contexts/AuthContext';
import { useProcurement } from '../../contexts/ProcurementContext';
import { useAlert } from '@/template';
import { CROPS, CENTRES } from '../../constants/config';
import { getSlots, formatCurrency } from '../../services/procurementService';
import { recommendBestSlot, predictCrowding } from '../../services/aiService';
import { ScreenHeader, KButton, AIPredictionCard } from '../../components';

type Step = 'crop' | 'slots' | 'confirm';

export default function BookSlotScreen() {
  const { t } = useLang();
  const { user } = useAuth();
  const { registerCrop, bookSlot } = useProcurement();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [step, setStep] = useState<Step>('crop');
  const [selectedCropId, setSelectedCropId] = useState('paddy');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [quantity, setQuantity] = useState('');
  const [centreId, setCentreId] = useState(user?.centreId || 'c2');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState(0);
  const [loading, setLoading] = useState(false);

  const selectedCrop = CROPS.find(c => c.id === selectedCropId);
  const centre = CENTRES.find(c => c.id === centreId);
  const date = '2026-09-01';
  const slots = getSlots(date, centre?.capacity || 20);
  const aiRec = recommendBestSlot(slots);
  const crowding = predictCrowding(centreId, selectedHour || 10);

  const handleNextFromCrop = () => {
    if (!selectedCropId || !quantity || Number(quantity) < 1) {
      showAlert('Missing Info', 'Please select crop and enter quantity.');
      return;
    }
    setStep('slots');
  };

  const handleNextFromSlots = () => {
    if (!selectedSlot) {
      showAlert('Select Slot', 'Please select a time slot.');
      return;
    }
    setStep('confirm');
  };

  const handleBook = () => {
    setLoading(true);
    setTimeout(() => {
      const cropRegId = registerCrop({
        farmerId: user?.id || 'f001',
        cropId: selectedCropId,
        variety: selectedVariety || (selectedCrop?.varieties[0] || ''),
        quantity: Number(quantity),
        harvestDate: '2026-08-25',
        centreId,
        season: 'Kharif 2026',
      });
      bookSlot({
        farmerId: user?.id || 'f001',
        cropRegistrationId: cropRegId,
        centreId,
        date,
        timeSlot: selectedSlot || '',
        status: 'booked',
      });
      setLoading(false);
      showAlert('Booking Confirmed!', `Your slot has been booked for ${date} at ${selectedSlot}.`, [
        { text: 'View Token', onPress: () => router.push('/(tabs)/queue') },
      ]);
      setStep('crop');
      setQuantity('');
      setSelectedSlot(null);
    }, 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title={t('bookSlot')} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Step indicator */}
        <View style={styles.stepRow}>
          {['crop', 'slots', 'confirm'].map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepCircle, step === s && styles.stepActive, ['slots', 'confirm'].includes(step) && i === 0 && styles.stepDone]}>
                <Text style={styles.stepNum}>{i + 1}</Text>
              </View>
              <Text style={styles.stepLbl}>{['Crop', 'Slot', 'Confirm'][i]}</Text>
              {i < 2 ? <View style={styles.stepLine} /> : null}
            </View>
          ))}
        </View>

        {/* Step 1: Crop */}
        {step === 'crop' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('cropRegistration')}</Text>

            <Text style={styles.fieldLabel}>{t('selectCrop')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropScroll}>
              <View style={styles.cropRow}>
                {CROPS.map(crop => (
                  <Pressable
                    key={crop.id}
                    onPress={() => { setSelectedCropId(crop.id); setSelectedVariety(''); }}
                    style={[styles.cropChip, selectedCropId === crop.id && styles.cropChipActive]}
                  >
                    <Text style={styles.cropIcon}>{crop.icon}</Text>
                    <Text style={[styles.cropLabel, selectedCropId === crop.id && styles.cropLabelActive]}>{t(crop.nameKey)}</Text>
                    <Text style={styles.mspText}>₹{selectedCrop?.mspRate}/kg</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.fieldLabel}>{t('variety')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                {(selectedCrop?.varieties || []).map(v => (
                  <Pressable
                    key={v}
                    onPress={() => setSelectedVariety(v)}
                    style={[styles.varChip, selectedVariety === v && styles.varChipActive]}
                  >
                    <Text style={[styles.varText, selectedVariety === v && styles.varTextActive]}>{v}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>{t('quantity')}</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="e.g. 850"
              placeholderTextColor={Colors.textMuted}
            />

            {quantity && selectedCrop ? (
              <View style={styles.mspCard}>
                <Text style={styles.mspCardText}>
                  MSP Rate: ₹{selectedCrop.mspRate}/kg
                </Text>
                <Text style={styles.mspCardValue}>
                  Estimated: {formatCurrency(Number(quantity) * selectedCrop.mspRate)}
                </Text>
              </View>
            ) : null}

            <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>{t('preferredCentre')}</Text>
            {CENTRES.map(c => (
              <Pressable
                key={c.id}
                onPress={() => setCentreId(c.id)}
                style={[styles.centreOption, centreId === c.id && styles.centreOptionActive]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.centreOptName}>{c.name}</Text>
                  <Text style={styles.centreOptDist}>{c.district}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: c.status === 'normal' ? Colors.success : c.status === 'moderate' ? Colors.warning : Colors.error }]} />
              </Pressable>
            ))}

            <KButton label={t('next')} onPress={handleNextFromCrop} fullWidth style={{ marginTop: Spacing.lg }} />
          </View>
        ) : null}

        {/* Step 2: Slots */}
        {step === 'slots' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('availableSlots')}</Text>
            <Text style={styles.subTitle}>{centre?.name} · {date}</Text>

            <AIPredictionCard
              estimatedWait={aiRec.estimatedWait}
              crowdLevel={aiRec.crowdLevel}
              slotTime={aiRec.time}
            />

            <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
              {slots.map(slot => {
                const full = slot.available === 0;
                const isRec = slot.time === aiRec.time;
                const isSelected = selectedSlot === slot.time;
                return (
                  <Pressable
                    key={slot.time}
                    disabled={full}
                    onPress={() => { setSelectedSlot(slot.time); setSelectedHour(slot.hour); }}
                    style={[styles.slotRow, full && styles.slotFull, isSelected && styles.slotSelected]}
                  >
                    <MaterialIcons name="schedule" size={20} color={full ? Colors.textMuted : isSelected ? Colors.textWhite : Colors.primary} />
                    <Text style={[styles.slotTime, full && styles.slotFullText, isSelected && { color: Colors.textWhite }]}>{slot.time}</Text>
                    {full ? (
                      <Text style={styles.slotFullBadge}>{t('slotFull')}</Text>
                    ) : (
                      <Text style={[styles.slotAvail, isSelected && { color: Colors.accentLight }]}>{slot.available} {t('slotsLeft')}</Text>
                    )}
                    {isRec && !full ? (
                      <View style={styles.recTag}>
                        <MaterialIcons name="star" size={10} color={Colors.textOnAccent} />
                        <Text style={styles.recTagText}>AI Pick</Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
              <KButton label={t('back')} onPress={() => setStep('crop')} variant="outline" style={{ flex: 1 }} />
              <KButton label={t('next')} onPress={handleNextFromSlots} style={{ flex: 1 }} />
            </View>
          </View>
        ) : null}

        {/* Step 3: Confirm */}
        {step === 'confirm' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('confirm')}</Text>

            <View style={styles.summaryBox}>
              <SummaryRow label={t('crop')} value={`${selectedCrop?.icon} ${t(selectedCropId)}`} />
              <SummaryRow label={t('variety')} value={selectedVariety || selectedCrop?.varieties[0] || '-'} />
              <SummaryRow label={t('quantity')} value={`${quantity} kg`} />
              <SummaryRow label={t('preferredCentre')} value={centre?.name || '-'} />
              <SummaryRow label={t('date')} value={date} />
              <SummaryRow label={t('time')} value={selectedSlot || '-'} />
              <SummaryRow label="Estimated Value" value={formatCurrency(Number(quantity) * (selectedCrop?.mspRate || 0))} bold />
            </View>

            <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg }}>
              <KButton label={t('back')} onPress={() => setStep('slots')} variant="outline" style={{ flex: 1 }} />
              <KButton label={t('confirm')} onPress={handleBook} style={{ flex: 1 }} loading={loading} />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.md },
  stepRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.lg, gap: 0 },
  stepItem: { alignItems: 'center', position: 'relative', flexDirection: 'row', gap: 4 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
  },
  stepActive: { backgroundColor: Colors.primary },
  stepDone: { backgroundColor: Colors.success },
  stepNum: { color: Colors.textWhite, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  stepLbl: { fontSize: FontSize.xs, color: Colors.textSecondary, marginRight: 4 },
  stepLine: { width: 24, height: 2, backgroundColor: Colors.border },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.md, gap: 0 },
  cardTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  subTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  fieldLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium, marginBottom: 8 },
  cropScroll: { marginBottom: Spacing.md },
  cropRow: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: 4 },
  cropChip: {
    alignItems: 'center', padding: Spacing.sm, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, minWidth: 80, backgroundColor: Colors.surface,
  },
  cropChipActive: { borderColor: Colors.primary, backgroundColor: Colors.surfaceTint },
  cropIcon: { fontSize: 24, marginBottom: 4 },
  cropLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  cropLabelActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  mspText: { fontSize: 9, color: Colors.textMuted, marginTop: 2 },
  varChip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.pill, borderWidth: 1.5, borderColor: Colors.border,
  },
  varChipActive: { borderColor: Colors.primary, backgroundColor: Colors.surfaceTint },
  varText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  varTextActive: { color: Colors.primary, fontWeight: FontWeight.semiBold },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.md, fontSize: FontSize.lg, color: Colors.textPrimary,
    marginBottom: Spacing.sm, minHeight: 52,
  },
  mspCard: {
    backgroundColor: Colors.surfaceTint, borderRadius: Radius.md,
    padding: Spacing.sm, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
  },
  mspCardText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  mspCardValue: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  centreOption: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    padding: Spacing.sm, marginBottom: 6,
  },
  centreOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.surfaceTint },
  centreOptName: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  centreOptDist: { fontSize: FontSize.xs, color: Colors.textMuted },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  slotRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  slotFull: { backgroundColor: Colors.surfaceTint, opacity: 0.6 },
  slotSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotTime: { flex: 1, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  slotFullText: { color: Colors.textMuted },
  slotFullBadge: {
    backgroundColor: Colors.errorLight, color: Colors.error,
    fontSize: FontSize.xs, fontWeight: FontWeight.semiBold,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill,
  },
  slotAvail: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  recTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.accent, borderRadius: Radius.pill,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  recTagText: { fontSize: 9, fontWeight: FontWeight.bold, color: Colors.textOnAccent },
  summaryBox: { backgroundColor: Colors.surfaceTint, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, maxWidth: '60%', textAlign: 'right' },
  summaryBold: { fontWeight: FontWeight.bold, color: Colors.primary, fontSize: FontSize.md },
});
