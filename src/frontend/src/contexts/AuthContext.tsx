import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';

interface AuthContextType {
  isAuthenticated: boolean;
  principal: string | null;
  sessionId: string | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, login: iiLogin, clear: iiClear, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (identity && actor && !sessionId) {
      actor.createSession().then((newSessionId) => {
        setSessionId(newSessionId);
        localStorage.setItem('sessionId', newSessionId);
      });
    }
  }, [identity, actor, sessionId]);

  const login = () => {
    iiLogin();
  };

  const logout = async () => {
    if (sessionId && actor) {
      try {
        await actor.endSession(sessionId);
      } catch (error) {
        console.error('Error ending session:', error);
      }
    }
    setSessionId(null);
    localStorage.removeItem('sessionId');
    iiClear();
  };

  const isAuthenticated = !!identity && !!sessionId;
  const principal = identity?.getPrincipal().toString() || null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        principal,
        sessionId,
        isLoading: isLoading || loginStatus === 'initializing',
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
