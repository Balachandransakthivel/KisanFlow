import type { QueueStatus } from '../constants/config';
import { Colors } from '../constants/theme';

export function getStatusLabel(status: QueueStatus, t: (k: string) => string): string {
  const map: Record<QueueStatus, string> = {
    booked: t('booked'),
    arrived: t('arrived'),
    waiting: t('waiting'),
    called: t('called'),
    weighment: t('weighment'),
    quality_check: t('qualityCheck'),
    accepted: t('accepted'),
    rejected: t('rejected'),
    completed: t('completed'),
    payment_pending: t('paymentStatus'),
    paid: t('paid'),
  };
  return map[status] ?? status;
}

export function getStatusColor(status: QueueStatus): string {
  const map: Record<QueueStatus, string> = {
    booked: Colors.statusBooked,
    arrived: Colors.statusArrived,
    waiting: Colors.statusWaiting,
    called: Colors.statusCalled,
    weighment: Colors.statusWeighment,
    quality_check: Colors.statusQuality,
    accepted: Colors.statusAccepted,
    rejected: Colors.statusRejected,
    completed: Colors.statusCompleted,
    payment_pending: Colors.statusPaymentPending,
    paid: Colors.statusPaid,
  };
  return map[status] ?? Colors.textMuted;
}

export function generateProcurementId(): string {
  const num = Math.floor(Math.random() * 900000) + 100000;
  return `PROC-2026-${num}`;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getSlots(date: string, centreCapacity: number): Array<{
  time: string; available: number; hour: number; total: number;
}> {
  const slots = [
    { time: '8:00 – 9:00 AM', hour: 8 },
    { time: '9:00 – 10:00 AM', hour: 9 },
    { time: '10:00 – 11:00 AM', hour: 10 },
    { time: '11:00 AM – 12:00 PM', hour: 11 },
    { time: '12:00 – 1:00 PM', hour: 12 },
    { time: '2:00 – 3:00 PM', hour: 14 },
    { time: '3:00 – 4:00 PM', hour: 15 },
    { time: '4:00 – 5:00 PM', hour: 16 },
  ];
  const seedMap: Record<number, number> = {
    8: 4, 9: 2, 10: 0, 11: 7, 12: 11, 14: 15, 15: 12, 16: 8,
  };
  return slots.map(s => ({
    ...s,
    total: centreCapacity,
    available: Math.min(centreCapacity, seedMap[s.hour] ?? Math.floor(Math.random() * centreCapacity)),
  }));
}
