'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ProfileResponse, PermissionResponse } from '@/src/types';
import { profileApi } from '@/src/lib/api';

interface AuthContextType {
  profile: ProfileResponse | null;
  loading: boolean;
  hasPermission: (featureCode: string, action: 'canView' | 'canEdit') => boolean;
  reload: () => void;
}

const AuthContext = createContext<AuthContextType>({
  profile: null,
  loading: true,
  hasPermission: () => false,
  reload: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await profileApi.get();
      setProfile(res.data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const hasPermission = (featureCode: string, action: 'canView' | 'canEdit') => {
    if (!profile) return false;
    const perm = profile.permissions.find(p => p.featureCode === featureCode);
    return perm ? perm[action] : false;
  };

  return (
    <AuthContext.Provider value={{ profile, loading, hasPermission, reload: load }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);