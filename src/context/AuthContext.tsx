import React, { createContext, useState, useEffect, useContext } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'guru' | 'siswa';
  nama: string;
  profile?: any;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('lkpd_token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (currentToken: string) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
      } else {
        // Token might be expired
        logout();
      }
    } catch (err) {
      console.warn('Gagal menghubungi server LKPD (offline / server booting):', err);
      // Keep token to allow automatic recovery once server is up.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('lkpd_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        return true;
      } else {
        setError(data.error?.message || 'Login gagal.');
        return false;
      }
    } catch (err) {
      setError('Koneksi server terputus.');
      return false;
    }
  };

  const register = async (regData: any): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('lkpd_token', data.data.token);
        setToken(data.data.token);
        setUser(data.data.user);
        return true;
      } else {
        setError(data.error?.message || 'Registrasi gagal.');
        return false;
      }
    } catch (err) {
      setError('Koneksi server terputus.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('lkpd_token');
    setToken(null);
    setUser(null);
    setLoading(false);
    setError(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
