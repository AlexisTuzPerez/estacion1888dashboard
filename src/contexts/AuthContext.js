'use client';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { verifyAuth } from '../actions/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null indica que aún no sabemos el estado
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyAuth();
      
      setIsAuthenticated(isValid);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated === false && pathname !== '/iniciar-sesion') {
      router.push('/iniciar-sesion');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    document.cookie = 'toDoAppCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAuthenticated(false);
    router.push('/iniciar-sesion');
  };

  const checkTokenExpiry = async () => {
    const isValid = await verifyAuth();
    if (!isValid) {
      logout();
    }
    return isValid;
  };

  if (isAuthenticated === false && pathname !== '/iniciar-sesion') {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, checkTokenExpiry }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

