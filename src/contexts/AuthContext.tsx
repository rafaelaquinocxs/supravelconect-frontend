import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  avatarUrl?: string;
  userType: string;
  role?: string;
  isActive: boolean;
  credits: number;
  rating: number;
  totalRatings: number;
  totalSessions: number;
  totalSessionsAsProvider: number;
  serviceProvider?: any;
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
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

  // Verificar token salvo no localStorage ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
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
            
            // CORREÇÃO: Não tentar verificar token se a rota não existe
            // Manter usuário logado com base no localStorage
            
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse do usuário salvo:', parseError);
            handleLogout();
          }
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      
      console.log('🔐 Tentando fazer login...');
      
      // CORREÇÃO: Usar /auth/login ao invés de /api/auth/login
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
          
          // Salvar no localStorage
          localStorage.setItem('token', responseToken);
          localStorage.setItem('user', JSON.stringify(responseUser));
          
          // Configurar token no axios
          api.defaults.headers.common['Authorization'] = `Bearer ${responseToken}`;
          
          console.log('✅ Login realizado com sucesso');
          
          return { success: true, message: 'Login realizado com sucesso' };
        } else {
          console.error('❌ Resposta inválida do servidor - token ou user ausente');
          return { success: false, message: 'Resposta inválida do servidor' };
        }
      } else {
        console.error('❌ Login falhou:', response.data.message);
        return { success: false, message: response.data.message || 'Erro no login' };
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      let errorMessage = 'Erro interno do servidor';
      
      if (error.response) {
        // Erro de resposta do servidor
        if (error.response.status === 401) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Dados inválidos';
        } else if (error.response.status === 404) {
          errorMessage = 'Rota não encontrada. Verifique se o backend está rodando corretamente.';
        } else if (error.response.status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente.';
        } else {
          errorMessage = error.response.data?.message || 'Erro no servidor';
        }
      } else if (error.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão. Verifique se o backend está rodando na porta 5000.';
      } else {
        // Erro de configuração
        errorMessage = 'Erro inesperado. Tente novamente.';
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);
      
      console.log('📝 Tentando registrar usuário...');
      
      // Limpar telefone se fornecido
      const cleanUserData = {
        ...userData,
        email: userData.email.trim().toLowerCase(),
        name: userData.name.trim(),
        phone: userData.phone ? userData.phone.replace(/\D/g, '') : undefined
      };
      
      // CORREÇÃO: Usar /auth/register ao invés de /api/auth/register
      const response = await api.post('/api/auth/register', cleanUserData);

      console.log('📡 Resposta do registro:', response.data);

      if (response.data.success) {
        const { token: responseToken, user: responseUser } = response.data;
        
        if (responseToken && responseUser) {
          setToken(responseToken);
          setUser(responseUser);
          
          // Salvar no localStorage
          localStorage.setItem('token', responseToken);
          localStorage.setItem('user', JSON.stringify(responseUser));
          
          // Configurar token no axios
          api.defaults.headers.common['Authorization'] = `Bearer ${responseToken}`;
          
          console.log('✅ Registro realizado com sucesso');
          
          return { success: true, message: 'Conta criada com sucesso' };
        } else {
          console.error('❌ Resposta inválida do servidor - token ou user ausente');
          return { success: false, message: 'Resposta inválida do servidor' };
        }
      } else {
        console.error('❌ Registro falhou:', response.data.message);
        return { success: false, message: response.data.message || 'Erro no registro' };
      }
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      
      let errorMessage = 'Erro interno do servidor';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Dados inválidos';
          
          // Se há erros específicos, mostrar o primeiro
          if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
            errorMessage = error.response.data.errors[0];
          }
        } else if (error.response.status === 409) {
          errorMessage = 'Email já está em uso';
        } else {
          errorMessage = error.response.data?.message || 'Erro no servidor';
        }
      } else if (error.request) {
        errorMessage = 'Erro de conexão. Verifique se o backend está rodando na porta 5000.';
      } else {
        errorMessage = 'Erro inesperado. Tente novamente.';
      }
      
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
    updateUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};