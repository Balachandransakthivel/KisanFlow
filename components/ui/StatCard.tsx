import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  accent?: string;
  bgColor?: string;
}

export function StatCard({ label, value, icon, accent = Colors.primary, bgColor = Colors.surface }: StatCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: bgColor }, Shadow.sm]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    margin: Spacing.xs,
  },
  icon: { fontSize: 22, marginBottom: 4 },
  value: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold },
  label: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
});
