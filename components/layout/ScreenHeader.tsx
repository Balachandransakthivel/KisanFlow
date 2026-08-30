import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { useLang } from '../../contexts/LangContext';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
  dark?: boolean;
}

export function ScreenHeader({ title, showBack, right, dark }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { lang, setLang } = useLang();
  const bg = dark ? Colors.primaryDark : Colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: bg, paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={8}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textWhite} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.rightRow}>
          <Pressable
            onPress={() => setLang(lang === 'en' ? 'ta' : 'en')}
            style={styles.langBtn}
            hitSlop={8}
          >
            <Text style={styles.langText}>{lang === 'en' ? 'த' : 'EN'}</Text>
          </Pressable>
          {right}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: Spacing.md, paddingHorizontal: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  title: { flex: 1, textAlign: 'center', fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textWhite },
  iconBtn: { width: 40 },
  rightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  langText: { color: Colors.textWhite, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
});
