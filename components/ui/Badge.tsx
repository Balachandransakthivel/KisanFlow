import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, FontSize, FontWeight } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, color = Colors.textWhite, bgColor = Colors.primary, size = 'md' }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, size === 'sm' && styles.sm]}>
      <Text style={[styles.text, { color }, size === 'sm' && styles.textSm]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  sm: { paddingHorizontal: 7, paddingVertical: 2 },
  text: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold },
  textSm: { fontSize: FontSize.xs },
});
