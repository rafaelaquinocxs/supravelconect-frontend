import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  averageRating: number;
  availableCredits: number;
  pendingRequests: number;
  completedToday: number;
}

interface RecentSession {
  id: string;
  helperName: string;
  specialty: string;
  status: 'completed' | 'active' | 'scheduled';
  date: string;
  rating?: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    activeSessions: 0,
    averageRating: 0,
    availableCredits: 0,
    pendingRequests: 0,
    completedToday: 0
  });
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, sessionsResponse] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/dashboard/recent-sessions')
      ]);
      
      setStats(statsResponse.data.data);
      setRecentSessions(sessionsResponse.data.data);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      
      // Dados mockados
      setStats({
        totalSessions: 47,
        activeSessions: 2,
        averageRating: 4.8,
        availableCredits: 150,
        pendingRequests: 3,
        completedToday: 5
      });
      
      setRecentSessions([
        {
          id: '1',
          helperName: 'João Silva',
          specialty: 'Elétrica',
          status: 'completed',
          date: '2025-01-08T14:30:00Z',
          rating: 5
        },
        {
          id: '2',
          helperName: 'Maria Santos',
          specialty: 'Hidráulica',
          status: 'active',
          date: '2025-01-08T16:00:00Z'
        },
        {
          id: '3',
          helperName: 'Carlos Oliveira',
          specialty: 'Motor',
          status: 'scheduled',
          date: '2025-01-09T09:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'active': return 'text-blue-400';
      case 'scheduled': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'active': return 'Ativa';
      case 'scheduled': return 'Agendada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Olá, {user?.name}! 👋
        </h1>
        <p className="text-gray-400">
          Bem-vindo ao seu painel. Aqui você pode gerenciar suas sessões e encontrar especialistas.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Sessões</p>
              <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Sessões Ativas</p>
              <p className="text-2xl font-bold text-white">{stats.activeSessions}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avaliação Média</p>
              <p className="text-2xl font-bold text-white">{stats.averageRating}</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Créditos Disponíveis</p>
              <p className="text-2xl font-bold text-white">{stats.availableCredits}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ações Rápidas */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/app/specialists"
                className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-lg transition-colors text-center group"
              >
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="font-medium">Encontrar Especialista</span>
                </div>
              </Link>

              <Link
                to="/app/schedule"
                className="bg-gray-700 hover:bg-gray-600 text-white p-6 rounded-lg transition-colors text-center group"
              >
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Agendar Sessão</span>
                </div>
              </Link>

              <Link
                to="/app/credits"
                className="bg-gray-700 hover:bg-gray-600 text-white p-6 rounded-lg transition-colors text-center group"
              >
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="font-medium">Comprar Créditos</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Resumo de Atividades */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6">Resumo de Hoje</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Sessões Concluídas</span>
              <span className="text-white font-medium">{stats.completedToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Pedidos Pendentes</span>
              <span className="text-yellow-400 font-medium">{stats.pendingRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Sessões Ativas</span>
              <span className="text-green-400 font-medium">{stats.activeSessions}</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <Link
              to="/app/sessions"
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors text-center block"
            >
              Ver Todas as Sessões
            </Link>
          </div>
        </div>
      </div>

      {/* Sessões Recentes */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Sessões Recentes</h2>
          <Link to="/app/sessions" className="text-red-400 hover:text-red-300 text-sm">
            Ver todas
          </Link>
        </div>

        {recentSessions.length > 0 ? (
          <div className="space-y-4">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {session.helperName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{session.helperName}</h3>
                    <p className="text-gray-400 text-sm">{session.specialty}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-sm font-medium ${getStatusColor(session.status)}`}>
                    {getStatusText(session.status)}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {formatDate(session.date)}
                  </div>
                  {session.rating && (
                    <div className="text-yellow-400 text-xs">
                      {'★'.repeat(session.rating)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">Nenhuma sessão recente</div>
            <Link
              to="/app/specialists"
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Encontrar Especialista
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;