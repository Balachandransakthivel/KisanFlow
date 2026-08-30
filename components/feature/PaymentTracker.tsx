import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { formatCurrency } from '../../services/procurementService';
import type { PaymentRecord } from '../../contexts/ProcurementContext';
import { useLang } from '../../contexts/LangContext';

const STEPS = [
  { key: 'bill_generated', label: 'billGenerated', icon: 'receipt' },
  { key: 'submitted', label: 'paymentSubmitted', icon: 'send' },
  { key: 'bank_processing', label: 'bankProcessing', icon: 'account-balance' },
  { key: 'credited', label: 'paymentCredited', icon: 'payments' },
] as const;

const STATUS_ORDER = ['pending', 'bill_generated', 'submitted', 'bank_processing', 'credited'];

interface PaymentTrackerProps {
  payment: PaymentRecord;
}

export function PaymentTracker({ payment }: PaymentTrackerProps) {
  const { t } = useLang();
  const currentIdx = STATUS_ORDER.indexOf(payment.status);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('paymentStatus')}</Text>

      {payment.status === 'credited' ? (
        <View style={styles.paidBanner}>
          <Text style={styles.paidIcon}>💰</Text>
          <View>
            <Text style={styles.paidAmount}>{formatCurrency(payment.amount)}</Text>
            <Text style={styles.paidSub}>{t('paymentCredited')}</Text>
            {payment.transactionRef ? (
              <Text style={styles.txRef}>Ref: {payment.transactionRef}</Text>
            ) : null}
          </View>
        </View>
      ) : (
        <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
      )}

      <View style={styles.steps}>
        {STEPS.map((step, idx) => {
          const stepIdx = STATUS_ORDER.indexOf(step.key);
          const done = stepIdx <= currentIdx;
          const active = stepIdx === currentIdx;
          return (
            <View key={step.key} style={styles.stepRow}>
              <View style={[styles.circle, done && styles.circleDone, active && styles.circleActive]}>
                <MaterialIcons
                  name={step.icon as any}
                  size={16}
                  color={done ? Colors.textWhite : Colors.textMuted}
                />
              </View>
              {idx < STEPS.length - 1 ? (
                <View style={[styles.line, done && styles.lineDone]} />
              ) : null}
              <View style={styles.stepLabel}>
                <Text style={[styles.stepText, done && styles.stepDone]}>{t(step.label)}</Text>
                {active ? <Text style={styles.activeTag}>{t('processing')}</Text> : null}
                {done && !active ? <Text style={styles.doneTag}>{t('completed')}</Text> : null}
                {!done && !active ? <Text style={styles.pendingTag}>{t('pending')}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadow.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  amount: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: Spacing.md },
  paidBanner: {
    flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.successLight,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center',
  },
  paidIcon: { fontSize: 32 },
  paidAmount: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.success },
  paidSub: { fontSize: FontSize.sm, color: Colors.success },
  txRef: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  steps: { gap: 0 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  circle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  circleDone: { backgroundColor: Colors.success },
  circleActive: { backgroundColor: Colors.warning },
  line: { position: 'absolute', left: 15, top: 32, width: 2, height: 36, backgroundColor: Colors.border },
  lineDone: { backgroundColor: Colors.success },
  stepLabel: { flex: 1, paddingLeft: Spacing.md, paddingBottom: Spacing.md },
  stepText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  stepDone: { color: Colors.textPrimary },
  activeTag: { fontSize: FontSize.xs, color: Colors.warning, marginTop: 2 },
  doneTag: { fontSize: FontSize.xs, color: Colors.success, marginTop: 2 },
  pendingTag: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
});
