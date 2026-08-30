import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '../constants/theme';
import { useLang } from '../contexts/LangContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '@/template';
import { KButton, InputField } from '../components';
import type { Role } from '../constants/config';

const ROLES: { id: Role; icon: string; color: string; descKey: string }[] = [
  { id: 'farmer', icon: '👨‍🌾', color: Colors.primary, descKey: 'farmer' },
  { id: 'officer', icon: '👨‍💼', color: Colors.info, descKey: 'officer' },
  { id: 'admin', icon: '🏢', color: Colors.accentDark, descKey: 'admin' },
];

const MOCK_MOBILES: Record<Role, string> = {
  farmer: '9876543210',
  officer: '9123456780',
  admin: '9001234567',
};

export default function LoginScreen() {
  const { t, lang, setLang } = useLang();
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedRole, setSelectedRole] = useState<Role>('farmer');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'role' | 'otp'>('role');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = () => {
    if (mobile.length < 10) {
      showAlert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      showAlert('OTP Sent', `Demo OTP: 123456\n${t('otpSent')}`);
    }, 1200);
  };

  const handleVerify = () => {
    if (otp.length < 4) {
      showAlert('Invalid OTP', 'Please enter the OTP sent to your mobile.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login(mobile, selectedRole);
      setLoading(false);
      if (selectedRole === 'farmer') router.replace('/(tabs)/home');
      else if (selectedRole === 'officer') router.replace('/officer/dashboard');
      else router.replace('/admin/dashboard');
    }, 1000);
  };

  const prefillDemo = () => {
    setMobile(MOCK_MOBILES[selectedRole]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar style="dark" />

        <View style={styles.logoRow}>
          <Text style={styles.logo}>🌾</Text>
          <Text style={styles.appName}>{t('appName')}</Text>
          <Pressable
            onPress={() => setLang(lang === 'en' ? 'ta' : 'en')}
            style={styles.langBtn}
          >
            <Text style={styles.langTxt}>{lang === 'en' ? 'த' : 'EN'}</Text>
          </Pressable>
        </View>

        <Text style={styles.tagline}>{t('tagline')}</Text>

        {/* Mock Login Banner */}
        <View style={styles.mockBanner}>
          <MaterialIcons name="info" size={16} color={Colors.info} />
          <Text style={styles.mockText}>MOCK LOGIN — Demo mode. No real authentication.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('selectRole')}</Text>
          <View style={styles.rolesRow}>
            {ROLES.map(r => (
              <Pressable
                key={r.id}
                onPress={() => { setSelectedRole(r.id); setStep('role'); setMobile(''); setOtp(''); }}
                style={[styles.roleBtn, selectedRole === r.id && { borderColor: r.color, backgroundColor: `${r.color}15` }]}
              >
                <Text style={styles.roleIcon}>{r.icon}</Text>
                <Text style={[styles.roleLabel, selectedRole === r.id && { color: r.color, fontWeight: FontWeight.bold }]}>
                  {t(r.descKey)}
                </Text>
              </Pressable>
            ))}
          </View>

          <InputField
            label={t('mobileNumber')}
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="Enter 10-digit number"
          />

          <Pressable onPress={prefillDemo} style={styles.demoBtn}>
            <Text style={styles.demoText}>Use demo: {MOCK_MOBILES[selectedRole]}</Text>
          </Pressable>

          {step === 'otp' ? (
            <InputField
              label={t('enterOtp')}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Enter OTP (demo: 123456)"
            />
          ) : null}

          {step === 'role' ? (
            <KButton label={t('sendOtp')} onPress={handleSendOtp} fullWidth loading={loading} />
          ) : (
            <KButton label={t('verifyOtp')} onPress={handleVerify} fullWidth loading={loading} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  container: { paddingHorizontal: Spacing.lg, alignItems: 'stretch' },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, gap: Spacing.sm },
  logo: { fontSize: 36 },
  appName: { flex: 1, fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.primaryDark },
  langBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  langTxt: { color: Colors.textWhite, fontWeight: FontWeight.bold, fontSize: FontSize.sm },
  tagline: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg },
  mockBanner: {
    flexDirection: 'row', gap: 6, alignItems: 'center',
    backgroundColor: Colors.infoLight, borderRadius: Radius.sm, padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  mockText: { fontSize: FontSize.xs, color: Colors.info, flex: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  rolesRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  roleBtn: {
    flex: 1, alignItems: 'center', padding: Spacing.md,
    borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  roleIcon: { fontSize: 28, marginBottom: 4 },
  roleLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  demoBtn: { marginBottom: Spacing.md, alignItems: 'center' },
  demoText: { fontSize: FontSize.sm, color: Colors.primary, textDecorationLine: 'underline' },
});
