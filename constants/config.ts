export const CROPS = [
  { id: 'paddy', nameKey: 'paddy', icon: '🌾', mspRate: 2183, varieties: ['BPT 5204', 'MTU 7029', 'IR 64', 'Swarna', 'ADT 45'] },
  { id: 'wheat', nameKey: 'wheat', icon: '🌿', mspRate: 2275, varieties: ['HD 2967', 'GW 322', 'K 307', 'PBW 343'] },
  { id: 'maize', nameKey: 'maize', icon: '🌽', mspRate: 1962, varieties: ['DKC 9081', 'P 3396', 'NK 6240'] },
  { id: 'sorghum', nameKey: 'sorghum', icon: '🌱', mspRate: 3371, varieties: ['CSH 16', 'CSH 18', 'M 35-1'] },
  { id: 'millet', nameKey: 'millet', icon: '🌾', mspRate: 2500, varieties: ['CO 9', 'K 1', 'APM 1'] },
  { id: 'cotton', nameKey: 'cotton', icon: '🌸', mspRate: 6620, varieties: ['Bt Cotton', 'MCU 5', 'Bunny BG II'] },
  { id: 'groundnut', nameKey: 'groundnut', icon: '🥜', mspRate: 5850, varieties: ['TMV 2', 'CO 2', 'GG 2'] },
];

export const CENTRES = [
  { id: 'c1', name: 'Komarapalayam Procurement Centre', district: 'Namakkal', location: { lat: 11.4473, lng: 77.6976 }, capacity: 20, status: 'normal', waitingCount: 18, processingCount: 4, completedToday: 82 },
  { id: 'c2', name: 'Erode Primary Agriculture Centre', district: 'Erode', location: { lat: 11.3410, lng: 77.7172 }, capacity: 15, status: 'high', waitingCount: 34, processingCount: 6, completedToday: 67 },
  { id: 'c3', name: 'Salem TNSCB Centre', district: 'Salem', location: { lat: 11.6643, lng: 78.1460 }, capacity: 25, status: 'normal', waitingCount: 9, processingCount: 2, completedToday: 112 },
  { id: 'c4', name: 'Coimbatore Agri Procurement Hub', district: 'Coimbatore', location: { lat: 11.0168, lng: 76.9558 }, capacity: 30, status: 'moderate', waitingCount: 22, processingCount: 5, completedToday: 95 },
  { id: 'c5', name: 'Tirupur Farmer Collection Centre', district: 'Tirupur', location: { lat: 11.1085, lng: 77.3411 }, capacity: 18, status: 'normal', waitingCount: 7, processingCount: 3, completedToday: 58 },
];

export const QUALITY_THRESHOLDS: Record<string, { moisture: number; foreignMatter: number; damagedGrain: number }> = {
  paddy: { moisture: 14, foreignMatter: 1.0, damagedGrain: 2.0 },
  wheat: { moisture: 12, foreignMatter: 0.75, damagedGrain: 1.5 },
  maize: { moisture: 14, foreignMatter: 1.0, damagedGrain: 3.0 },
  sorghum: { moisture: 12, foreignMatter: 1.0, damagedGrain: 2.0 },
  millet: { moisture: 12, foreignMatter: 1.0, damagedGrain: 2.0 },
  cotton: { moisture: 8, foreignMatter: 0.5, damagedGrain: 2.0 },
  groundnut: { moisture: 8, foreignMatter: 1.0, damagedGrain: 3.0 },
};

export const ROLES = ['farmer', 'officer', 'admin'] as const;
export type Role = typeof ROLES[number];

export type QueueStatus =
  | 'booked'
  | 'arrived'
  | 'waiting'
  | 'called'
  | 'weighment'
  | 'quality_check'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'payment_pending'
  | 'paid';

export const QUEUE_STATUS_ORDER: QueueStatus[] = [
  'booked', 'arrived', 'waiting', 'called', 'weighment',
  'quality_check', 'accepted', 'completed', 'payment_pending', 'paid',
];
