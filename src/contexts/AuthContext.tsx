import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, authApi, setAuth, clearAuth, getToken, getUser } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getUser());
  const [token, setToken] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Verify token on mount
  useEffect(() => {
    if (token) {
      authApi.getMe().then((res) => {
        if (res.data?.user) setUser(res.data.user);
        else { clearAuth(); setUser(null); setToken(null); navigate('/login'); }
      }).catch(() => {
        clearAuth();
        setUser(null);
        setToken(null);
        navigate('/login');
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      const { token: newToken, user: newUser } = res.data as AuthResponse;
      setAuth(newToken, newUser);
      setToken(newToken);
      setUser(newUser);

      // Navigate based on role
      const routes: Record<string, string> = {
        owner: '/owner',
        rector: '/rector',
        student: '/student',
      };
      navigate(routes[newUser.role] ?? '/login');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
