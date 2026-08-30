// KisanFlow Design System
export const Colors = {
  // Brand
  primary: '#2E7D32',        // Deep green
  primaryLight: '#4CAF50',   // Light green
  primaryDark: '#1B5E20',    // Dark green
  accent: '#F9A825',         // Golden yellow
  accentLight: '#FFD54F',    // Light gold
  accentDark: '#F57F17',     // Dark gold

  // Surface
  background: '#F1F8E9',     // Very light green tint
  surface: '#FFFFFF',
  surfaceTint: '#E8F5E9',    // Green tinted surface
  surfaceDark: '#1A2E1A',    // Dark green surface

  // Semantic
  success: '#43A047',
  successLight: '#E8F5E9',
  warning: '#FB8C00',
  warningLight: '#FFF3E0',
  error: '#E53935',
  errorLight: '#FFEBEE',
  info: '#1976D2',
  infoLight: '#E3F2FD',

  // Text
  textPrimary: '#1A2E1A',
  textSecondary: '#4E6E4E',
  textMuted: '#8A9E8A',
  textWhite: '#FFFFFF',
  textOnAccent: '#1A1A00',

  // Queue Status Colors
  statusBooked: '#1976D2',
  statusArrived: '#7B1FA2',
  statusWaiting: '#F57C00',
  statusCalled: '#00897B',
  statusWeighment: '#5D4037',
  statusQuality: '#0288D1',
  statusAccepted: '#2E7D32',
  statusRejected: '#C62828',
  statusCompleted: '#1565C0',
  statusPaymentPending: '#EF6C00',
  statusPaid: '#2E7D32',

  // Border
  border: '#C8E6C9',
  borderDark: '#81C784',
  divider: '#E8F5E9',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 50,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#1A2E1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A2E1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A2E1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
};
