import axios, { AxiosResponse, AxiosError } from 'axios';

// Interfaces para tipagem
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    userType: string;
    role?: string;
    isActive: boolean;
    credits: number;
    rating: number;
    totalRatings: number;
    totalSessions: number;
    totalSessionsAsProvider: number;
    serviceProvider?: any;
    profileImage?: string;
    avatarUrl?: string;
  };
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  specialties: string[];
  rating: number;
  hourlyRate: number;
  isAvailable: boolean;
  location: string;
  experience: number;
  profileImage?: string;
  responseTime: string;
}

interface DashboardData {
  totalSessions: number;
  activeSessions: number;
  totalProviders: number;
  availableProviders: number;
  recentSessions: any[];
  upcomingAppointments: any[];
  notifications: any[];
}

// Configuração da instância do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', // CORREÇÃO: Remover /api do final
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos
});

console.log('🌐 Base URL da API:', api.defaults.baseURL);

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log da requisição para debug
    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    
    return config;
  },
  (error) => {
    console.error('❌ Erro na configuração da requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas e erros
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log da resposta bem-sucedida
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`, response.data);
    return response;
  },
  (error: AxiosError) => {
    // Log detalhado do erro
    console.error('❌ Erro na resposta da API:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 401:
          console.log('🔒 Token inválido ou expirado');
          // Limpar dados de autenticação
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirecionar para login apenas se não estiver já na página de auth
          if (!window.location.pathname.includes('/auth/')) {
            window.location.href = '/auth/login';
          }
          break;
          
        case 403:
          console.log('🚫 Acesso negado');
          break;
          
        case 404:
          console.log('🔍 Rota não encontrada:', error.config?.url);
          break;
          
        case 422:
          console.log('📝 Dados de validação inválidos');
          break;
          
        case 429:
          console.log('⏰ Muitas requisições - Rate limit');
          break;
          
        case 500:
          console.log('🔥 Erro interno do servidor');
          break;
          
        default:
          console.log(`⚠️ Erro HTTP ${status}`);
      }
    } else if (error.request) {
      console.error('🌐 Erro de rede - Backend não está respondendo');
    } else {
      console.error('⚙️ Erro de configuração:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ==================== FUNÇÕES DE AUTENTICAÇÃO ====================

export const authAPI = {
  // Login do usuário
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', { email, password } );
    return response.data;
  },

  // Registro de usuário
  register: async (userData: RegisterData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/register', userData);
    return response.data;
  },

  // Verificar token (usando /auth/me)
  verifyToken: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/auth/me');
    return response.data;
  },

  // Obter dados do usuário atual
  getMe: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/auth/me');
    return response.data;
  },

  // Atualizar perfil do usuário
  updateProfile: async (userData: any): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>('/api/auth/me', userData);
    return response.data;
  },

  // Logout (apenas limpa dados locais)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  }
};

// ==================== FUNÇÕES DE DASHBOARD ====================

export const dashboardAPI = {
  // Obter dados do dashboard
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await api.get<ApiResponse<DashboardData>>('/api/dashboard');
    return response.data;
  },

  // Obter estatísticas do usuário
  getUserStats: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/dashboard/stats');
    return response.data;
  }
};

// ==================== FUNÇÕES DE SERVICE PROVIDERS ====================

export const serviceProviderAPI = {
  // Listar prestadores de serviço
  getServiceProviders: async (filters?: any): Promise<ApiResponse<ServiceProvider[]>> => {
    const response = await api.get<ApiResponse<ServiceProvider[]>>('/api/service-providers', { params: filters });
    return response.data;
  },

  // Obter especialidades/categorias
  getSpecialties: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/service-providers/specialties');
    return response.data;
  },

  // Obter localizações disponíveis
  getLocations: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/service-providers/locations');
    return response.data;
  },

  // Obter detalhes de um prestador específico
  getServiceProvider: async (id: string): Promise<ApiResponse<ServiceProvider>> => {
    const response = await api.get<ApiResponse<ServiceProvider>>(`/api/service-providers/${id}`);
    return response.data;
  }
};

// ==================== FUNÇÕES DE USUÁRIO ====================

export const userAPI = {
  // Obter perfil de prestador de serviços
  getServiceProviderProfile: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/users/service-provider/profile');
    return response.data;
  },

  // Atualizar perfil de prestador de serviços
  updateServiceProviderProfile: async (profileData: any): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>('/api/users/service-provider/profile', profileData);
    return response.data;
  },

  // Alternar disponibilidade do prestador
  toggleAvailability: async (): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/api/users/service-provider/toggle-availability');
    return response.data;
  },

  // Obter estatísticas do prestador
  getProviderStats: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/users/service-provider/stats');
    return response.data;
  }
};

// ==================== FUNÇÕES DE APPOINTMENTS ====================

export const appointmentAPI = {
  // Listar appointments
  getAppointments: async (filters?: any): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/appointments', { params: filters });
    return response.data;
  },

  // Criar novo appointment
  createAppointment: async (appointmentData: any): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/api/appointments', appointmentData);
    return response.data;
  },

  // Obter detalhes de um appointment
  getAppointment: async (id: string): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>(`/api/appointments/${id}`);
    return response.data;
  },

  // Atualizar appointment
  updateAppointment: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/api/appointments/${id}`, data);
    return response.data;
  },

  // Cancelar appointment
  cancelAppointment: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/api/appointments/${id}`);
    return response.data;
  }
};

// ==================== FUNÇÕES DE VIDEOCHAMADAS ====================

export const videocallAPI = {
  // Listar videochamadas do usuário
  getUserVideocalls: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/videocalls/user');
    return response.data;
  },

  // Criar nova videochamada
  createVideocall: async (videocallData: any): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/api/videocalls', videocallData);
    return response.data;
  },

  // Entrar em uma videochamada
  joinVideocall: async (sessionId: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/api/videocalls/${sessionId}/join`);
    return response.data;
  },

  // Sair de uma videochamada
  leaveVideocall: async (sessionId: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/api/videocalls/${sessionId}/leave`);
    return response.data;
  },

  // Obter detalhes de uma videochamada
  getVideocall: async (sessionId: string): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>(`/api/videocalls/${sessionId}`);
    return response.data;
  },

  // Encerrar videochamada
  endVideocall: async (sessionId: string): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/api/videocalls/${sessionId}/end`);
    return response.data;
  }
};

// ==================== FUNÇÕES DE SESSÕES ====================

export const sessionAPI = {
  // Listar sessões
  getSessions: async (filters?: any): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/sessions', { params: filters });
    return response.data;
  },

  // Criar nova sessão
  createSession: async (sessionData: any): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/api/sessions', sessionData);
    return response.data;
  },

  // Obter detalhes de uma sessão
  getSession: async (id: string): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>(`/api/sessions/${id}`);
    return response.data;
  },

  // Finalizar sessão
  endSession: async (id: string, data?: any): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/api/sessions/${id}/end`, data);
    return response.data;
  }
};

// ==================== FUNÇÕES UTILITÁRIAS ====================

export const utilsAPI = {
  // Upload de arquivo
  uploadFile: async (file: File, type: string = 'general'): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post<ApiResponse>('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Buscar CEP
  searchCEP: async (cep: string): Promise<any> => {
    // Usar API externa para CEP
    const cleanCEP = cep.replace(/\D/g, '');
    const response = await axios.get(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    return response.data;
  },

  // Obter configurações do sistema
  getSystemConfig: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/config');
    return response.data;
  }
};

// ==================== FUNÇÕES DE NOTIFICAÇÕES ====================

export const notificationAPI = {
  // Listar notificações
  getNotifications: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/notifications');
    return response.data;
  },

  // Marcar notificação como lida
  markAsRead: async (id: string): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/api/notifications/${id}/read`);
    return response.data;
  },

  // Marcar todas como lidas
  markAllAsRead: async (): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>('/api/notifications/read-all');
    return response.data;
  }
};

// ==================== FUNÇÕES DE PAGAMENTO ====================

export const paymentAPI = {
  // Criar cobrança
  createCharge: async (chargeData: any): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/api/payments/charge', chargeData);
    return response.data;
  },

  // Listar transações
  getTransactions: async (filters?: any): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/payments/transactions', { params: filters });
    return response.data;
  },

  // Obter saldo
  getBalance: async (): Promise<ApiResponse> => {
    const response = await api.get<ApiResponse>('/api/payments/balance');
    return response.data;
  }
};

// ==================== EXPORTAÇÕES ====================

// Exportar instância principal
export default api;
export { api };

// Exportar todas as APIs organizadas
export const APIs = {
  auth: authAPI,
  dashboard: dashboardAPI,
  serviceProvider: serviceProviderAPI,
  user: userAPI,
  appointment: appointmentAPI,
  videocall: videocallAPI,
  session: sessionAPI,
  utils: utilsAPI,
  notification: notificationAPI,
  payment: paymentAPI
};

// Função helper para tratamento de erros
export const handleApiError = (error: any): string => {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;
    
    switch (status) {
      case 400:
        return message || 'Dados inválidos';
      case 401:
        return 'Não autorizado. Faça login novamente.';
      case 403:
        return 'Acesso negado';
      case 404:
        return 'Recurso não encontrado';
      case 422:
        return message || 'Dados de validação inválidos';
      case 429:
        return 'Muitas tentativas. Tente novamente mais tarde.';
      case 500:
        return 'Erro interno do servidor. Tente novamente.';
      default:
        return message || `Erro ${status}`;
    }
  } else if (error.request) {
    return 'Erro de conexão. Verifique sua internet e se o backend está rodando.';
  } else {
    return error.message || 'Erro inesperado';
  }
};

// Função para configurar token manualmente
export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  localStorage.setItem('token', token);
};

// Função para remover token
export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
