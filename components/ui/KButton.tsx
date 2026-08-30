import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, Radius, FontSize, FontWeight, Shadow } from '../../constants/theme';

interface KButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function KButton({ label, onPress, variant = 'primary', loading, disabled, style, fullWidth = false }: KButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        fullWidth && styles.full,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator size="small" color={variant === 'outline' ? Colors.primary : Colors.textWhite} />
        : <Text style={[styles.text, styles[`${variant}Text` as keyof typeof styles]]}>{label}</Text>
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...Shadow.sm,
  },
  full: { width: '100%' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.accent },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary, shadowOpacity: 0 },
  ghost: { backgroundColor: 'transparent', shadowOpacity: 0 },
  danger: { backgroundColor: Colors.error },
  text: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold },
  primaryText: { color: Colors.textWhite },
  secondaryText: { color: Colors.textOnAccent },
  outlineText: { color: Colors.primary },
  ghostText: { color: Colors.primary },
  dangerText: { color: Colors.textWhite },
});
