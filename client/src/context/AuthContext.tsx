import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import { verificationApi } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  verified: boolean;
}

export interface VerificationStatus {
  id: string;
  status: string;
  documentType: string | null;
  confidenceScore: number | null;
  failureReason: string | null;
  attemptNumber: number;
  consentGiven: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  verificationStatus: VerificationStatus | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshVerificationStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshVerificationStatus = async () => {
    try {
      const status = await verificationApi.getMyStatus();
      setVerificationStatus(status);
    } catch {
      setVerificationStatus(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch verification status when user is authenticated
  useEffect(() => {
    if (user) {
      refreshVerificationStatus();
    } else {
      setVerificationStatus(null);
    }
  }, [user]);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      setVerificationStatus(null);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      verificationStatus,
      setUser,
      logout,
      checkAuth,
      refreshVerificationStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
