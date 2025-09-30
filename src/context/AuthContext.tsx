import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  fullName: string | null;
  isOpsTeam: boolean;
  login: (data: {
    access: string;
    refresh: string;
    full_name: string;
    is_ops_team: boolean;
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [isOpsTeam, setIsOpsTeam] = useState(false);

  useEffect(() => {
    // Check for existing auth data in cookies
    const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    if (cookies.access && cookies.refresh) {
      setIsAuthenticated(true);
      setAccessToken(cookies.access);
      setRefreshToken(cookies.refresh);
      setFullName(decodeURIComponent(cookies.full_name || ''));
      setIsOpsTeam(cookies.is_ops_team === 'true');
    }
  }, []);

  const login = (data: {
    access: string;
    refresh: string;
    full_name: string;
    is_ops_team: boolean;
  }) => {
    setIsAuthenticated(true);
    setAccessToken(data.access);
    setRefreshToken(data.refresh);
    setFullName(data.full_name);
    setIsOpsTeam(data.is_ops_team);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAccessToken(null);
    setRefreshToken(null);
    setFullName(null);
    setIsOpsTeam(false);

    // Clear cookies
    document.cookie = 'access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'full_name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'is_ops_team=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessToken,
        refreshToken,
        fullName,
        isOpsTeam,
        login,
        logout,
      }}
    >
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