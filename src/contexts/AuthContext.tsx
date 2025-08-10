import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

// Tipos corrigidos para incluir todos os roles
export type UserRole = 'admin' | 'user' | 'client' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  company?: string;
  profileImage?: string;
  credits?: number;
  rating?: number;
  totalSessions?: number;
  isOnline?: boolean;
  
  // Campos de especialista
  specialty?: string;
  subSpecialties?: string[];
  description?: string;
  experience?: number;
  certifications?: string[];
  location?: string;
  hourlyRate?: number;
  responseTime?: string;
  isAvailableAsSpecialist?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  loading: boolean;
  // Propriedades adicionais que outros componentes esperam
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  role?: UserRole;
  specialties?: string[];
  experience?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Configurar token no header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Verificar se o token é válido
      const response = await api.get('/api/auth/me');
      
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        // Token inválido
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        
        // Salvar token
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Atualizar estado do usuário
        setUser(userData);
        
        toast.success('Login realizado com sucesso!');
      } else {
        throw new Error(response.data.message || 'Erro ao fazer login');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao fazer login';
      setError(message);
      toast.error(message);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setError(null);
      
      // Garantir que role seja do tipo correto
      const roleValue = userData.role as UserRole || 'user';
      
      const response = await api.post('/api/auth/register', {
        ...userData,
        role: roleValue
      });

      if (response.data.success) {
        const { token, user: newUser } = response.data.data;
        
        // Salvar token
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Atualizar estado do usuário
        setUser(newUser);
        
        toast.success('Cadastro realizado com sucesso!');
      } else {
        throw new Error(response.data.message || 'Erro ao fazer cadastro');
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao fazer cadastro';
      setError(message);
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
    toast.info('Logout realizado com sucesso!');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    // Propriedades adicionais
    isAuthenticated: !!user,
    isLoading: loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};