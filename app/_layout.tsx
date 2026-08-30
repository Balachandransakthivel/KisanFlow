import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { LangProvider } from '../contexts/LangContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ProcurementProvider } from '../contexts/ProcurementContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <LangProvider>
          <AuthProvider>
            <ProcurementProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </ProcurementProvider>
          </AuthProvider>
        </LangProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
