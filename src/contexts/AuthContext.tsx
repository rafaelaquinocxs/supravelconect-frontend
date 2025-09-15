import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

// Tipos exportados
export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'CLIENT' | 'SERVICE_PROVIDER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  avatarUrl?: string;
  userType: string;
  role?: UserRole;
  isActive: boolean;
  credits: number;
  rating: number;
  totalRatings: number;
  totalSessions: number;
  totalSessionsAsProvider: number;
  serviceProvider?: any;
  lastLoginAt?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
  isLoading: boolean; // Alias para loading
  error: string | null;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  userType?: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar token salvo no localStorage ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setError(null);
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            
            // Configurar token no axios
            api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
            
            console.log('✅ Token e usuário carregados do localStorage');
            
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse do usuário salvo:', parseError);
            setError('Erro ao carregar dados do usuário');
            handleLogout();
          }
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
        setError('Erro ao inicializar autenticação');
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔐 Tentando fazer login...');
      
      const response = await api.post('/api/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      console.log('📡 Resposta do login:', response.data);

      if (response.data.success) {
        const { token: responseToken, user: responseUser } = response.data;
        
        if (responseToken && responseUser) {
          setToken(responseToken);
          setUser(responseUser);
          setError(null);
          
          // Salvar no localStorage
          localStorage.setItem('token', responseToken);
          localStorage.setItem('user', JSON.stringify(responseUser));
          
          // Configurar token no axios
          api.defaults.headers.common['Authorization'] = `Bearer ${responseToken}`;
          
          console.log('✅ Login realizado com sucesso');
          
          return { success: true, message: 'Login realizado com sucesso' };
        } else {
          const errorMsg = 'Resposta inválida do servidor';
          setError(errorMsg);
          return { success: false, message: errorMsg };
        }
      } else {
        const errorMsg = response.data.message || 'Erro no login';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      let errorMessage = 'Erro interno do servidor';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.response.status === 404) {
          errorMessage = 'Usuário não encontrado';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Erro de conexão com o servidor';
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 Tentando registrar usuário...');
      
      const response = await api.post('/api/auth/register', {
        ...userData,
        email: userData.email.trim().toLowerCase()
      });

      console.log('📡 Resposta do registro:', response.data);

      if (response.data.success) {
        console.log('✅ Registro realizado com sucesso');
        return { success: true, message: 'Usuário registrado com sucesso' };
      } else {
        const errorMsg = response.data.message || 'Erro no registro';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      
      let errorMessage = 'Erro interno do servidor';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Dados inválidos';
        } else if (error.response.status === 409) {
          errorMessage = 'Email já está em uso';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Erro de conexão com o servidor';
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Fazendo logout...');
    handleLogout();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ Usuário atualizado');
    }
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isLoading: loading, // Alias para compatibilidade
    error,
    updateUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;