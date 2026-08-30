import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Role } from '../constants/config';

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  role: Role;
  farmerId?: string;
  village?: string;
  district?: string;
  centreId?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (mobile: string, role: Role) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const MOCK_USERS: Record<string, UserProfile> = {
  farmer: {
    id: 'f001', name: 'Ramesh Kumar', mobile: '9876543210', role: 'farmer',
    farmerId: 'TN-2026-F-001245', village: 'Perundurai', district: 'Erode', centreId: 'c2',
  },
  officer: {
    id: 'o001', name: 'Kumar Selvam', mobile: '9123456780', role: 'officer',
    district: 'Erode', centreId: 'c2',
  },
  admin: {
    id: 'a001', name: 'Dr. Anitha Rao', mobile: '9001234567', role: 'admin',
    district: 'Salem',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = (mobile: string, role: Role) => {
    const mockUser = { ...MOCK_USERS[role], mobile };
    setUser(mockUser);
  };

  const logout = () => setUser(null);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
}
