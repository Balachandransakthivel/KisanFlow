import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../constants/theme';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '@/template';
import { ScreenHeader, InputField, KButton } from '../components';

export default function ProfileScreen() {
  const { t } = useLang();
  const { user, updateProfile, logout } = useAuth();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState(user?.name || '');
  const [village, setVillage] = useState(user?.village || '');
  const [district, setDistrict] = useState(user?.district || '');

  const handleSave = () => {
    updateProfile({ name, village, district });
    showAlert('Saved', 'Profile updated successfully.');
  };

  const handleLogout = () => {
    showAlert('Logout', 'Are you sure you want to logout?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('logout'), style: 'destructive', onPress: () => { logout(); router.replace('/login'); } },
    ]);
  };

  const info = [
    { icon: 'badge', label: 'Role', value: user?.role || '-' },
    { icon: 'fingerprint', label: 'Farmer ID', value: user?.farmerId || '-' },
    { icon: 'phone', label: 'Mobile', value: user?.mobile || '-' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScreenHeader title={t('profile')} showBack />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name || 'F')[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.nameText}>{user?.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.card}>
          {info.map(item => (
            <View key={item.label} style={styles.infoRow}>
              <MaterialIcons name={item.icon as any} size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Edit */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Edit Profile</Text>
          <InputField label={t('name')} value={name} onChangeText={setName} />
          <InputField label={t('village')} value={village} onChangeText={setVillage} />
          <InputField label={t('district')} value={district} onChangeText={setDistrict} />
          <KButton label={t('save')} onPress={handleSave} fullWidth />
        </View>

        <KButton label={t('logout')} onPress={handleLogout} fullWidth variant="danger" style={styles.logoutBtn} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: Spacing.md, gap: Spacing.md },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.md,
  },
  avatarText: { fontSize: 36, fontWeight: FontWeight.bold, color: Colors.textWhite },
  nameText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: Spacing.sm },
  roleBadge: { backgroundColor: Colors.surfaceTint, borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 5, marginTop: 6 },
  roleText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary, letterSpacing: 1.5 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.sm, gap: 0 },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 80 },
  infoValue: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  logoutBtn: { marginTop: Spacing.md },
});
