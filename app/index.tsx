import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function IndexRedirect() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Redirect href="/onboarding" />;
  if (user?.role === 'farmer') return <Redirect href="/(tabs)/home" />;
  if (user?.role === 'officer') return <Redirect href="/officer/dashboard" />;
  if (user?.role === 'admin') return <Redirect href="/admin/dashboard" />;
  return <Redirect href="/onboarding" />;
}
