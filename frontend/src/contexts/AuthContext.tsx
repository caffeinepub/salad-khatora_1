import React, { createContext, useContext, useEffect, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface AuthContextType {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  principal: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isInitializing: true,
  isLoggingIn: false,
  login: async () => {},
  logout: async () => {},
  principal: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, clear, loginStatus, identity, isInitializing } = useInternetIdentity();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal().toString() ?? null;

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
      if (error?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await clear();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitializing: isInitializing || loginStatus === 'logging-in',
        isLoggingIn: isLoggingIn || loginStatus === 'logging-in',
        login: handleLogin,
        logout: handleLogout,
        principal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
