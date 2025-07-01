'use client';

import { createContext, useState, useEffect, ReactNode, useContext, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';

// Adicionamos 'avatarUrl' ao tipo User
interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null; 
}

// Adicionamos 'setUser' à interface do Contexto
interface AuthContextData {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setUser: Dispatch<SetStateAction<User | null>>; // <-- PROPRIEDADE ADICIONADA
}

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isAuthenticated = !!user;

  useEffect(() => {
    const token = localStorage.getItem('fintech.token');
    const storedUser = localStorage.getItem('fintech.user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  async function signIn(credentials: { email: string; password: string }) {
    const response = await api.post('/auth/login', credentials);
    const { token, user: userData } = response.data;

    localStorage.setItem('fintech.token', token);
    localStorage.setItem('fintech.user', JSON.stringify(userData));

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    
    router.push('/');
  }
  
  function logout() {
      localStorage.removeItem('fintech.token');
      localStorage.removeItem('fintech.user');
      setUser(null);
      router.push('/login');
  }

  return (
    // Passamos o setUser para o Provider para que toda a app o possa usar
    <AuthContext.Provider value={{ isAuthenticated, user, signIn, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para facilitar o uso do contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
