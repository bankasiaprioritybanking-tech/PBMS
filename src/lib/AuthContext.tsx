import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testAuth, setTestAuth] = useState<boolean>(false);

  useEffect(() => {
    // Check for development test auth first
    const testAuthToken = localStorage.getItem('pbms_test_auth');
    if (testAuthToken === 'true') {
      setTestAuth(true);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        localStorage.setItem('pbms_auth', 'true');
      } else {
        localStorage.removeItem('pbms_auth');
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      // Clear test auth
      localStorage.removeItem('pbms_test_auth');
      localStorage.removeItem('pbms_test_user');
      setTestAuth(false);

      await firebaseSignOut(auth);
      setUser(null);
      localStorage.removeItem('pbms_auth');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user || testAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
