import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

// Definição dos tipos unificados
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  phone?: string;
  company?: string;
  specialties?: string[];
  experience?: number;
  hourlyRate?: number;
  credits: number;
  rating: number;
  totalSessions: number;
  bio?: string;
  certifications?: string[];
  isApproved: boolean;
  profileImage?: string;
  availability?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Criação do contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await api.get('/api/auth/me');
          const userData = response.data.data;
          
          setUser({
            id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            phone: userData.phone,
            company: userData.company,
            specialties: userData.specialties || [],
            experience: userData.experience,
            hourlyRate: userData.hourlyRate,
            credits: userData.credits || 0,
            rating: userData.rating || 0,
            totalSessions: userData.totalSessions || 0,
            bio: userData.bio,
            certifications: userData.certifications || [],
            isApproved: userData.isApproved,
            profileImage: userData.profileImage,
            availability: userData.availability
          });
        } catch (err) {
          console.error('Erro ao verificar autenticação:', err);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    setError(null);
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { data } = response.data;
      
      const { token, ...userData } = data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser({
        id: userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        company: userData.company,
        specialties: userData.specialties || [],
        experience: userData.experience,
        hourlyRate: userData.hourlyRate,
        credits: userData.credits || 0,
        rating: userData.rating || 0,
        totalSessions: userData.totalSessions || 0,
        bio: userData.bio,
        certifications: userData.certifications || [],
        isApproved: userData.isApproved,
        profileImage: userData.profileImage,
        availability: userData.availability
      });
      
      toast.success('Login realizado com sucesso!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Registro
  const register = async (userData: any) => {
    setError(null);
    
    try {
      const response = await api.post('/api/auth/register', userData);
      const { data } = response.data;
      
      const { token, ...userInfo } = data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser({
        id: userInfo._id,
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
        phone: userInfo.phone,
        company: userInfo.company,
        specialties: userInfo.specialties || [],
        experience: userInfo.experience,
        hourlyRate: userInfo.hourlyRate,
        credits: userInfo.credits || 0,
        rating: userInfo.rating || 0,
        totalSessions: userInfo.totalSessions || 0,
        bio: userInfo.bio,
        certifications: userInfo.certifications || [],
        isApproved: userInfo.isApproved,
        profileImage: userInfo.profileImage,
        availability: userInfo.availability
      });
      
      toast.success('Cadastro realizado com sucesso!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer cadastro. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.info('Você saiu da sua conta');
    navigate('/');
  };

  // Atualizar dados do usuário
  const updateUser = async (userData: Partial<User>) => {
    setError(null);
    
    try {
      const response = await api.put('/api/auth/me', userData);
      const updatedUser = response.data.data;
      
      setUser({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        company: updatedUser.company,
        specialties: updatedUser.specialties || [],
        experience: updatedUser.experience,
        hourlyRate: updatedUser.hourlyRate,
        credits: updatedUser.credits || 0,
        rating: updatedUser.rating || 0,
        totalSessions: updatedUser.totalSessions || 0,
        bio: updatedUser.bio,
        certifications: updatedUser.certifications || [],
        isApproved: updatedUser.isApproved,
        profileImage: updatedUser.profileImage,
        availability: updatedUser.availability
      });
      
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar perfil. Tente novamente.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};

