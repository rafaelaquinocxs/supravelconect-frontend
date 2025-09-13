import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Play,
  Video,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Bell,
  ChevronRight,
  Plus,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface DashboardStats {
  totalSessions: number;
  activeSessions: number;
  pendingSessions: number;
  completedSessions: number;
  averageRating: number;
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
}

interface TimelineSession {
  _id: string;
  title: string;
  description: string;
  specialty: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  estimatedCost: number;
  clientId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  technicianId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    rating?: number;
  };
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    activeSessions: 0,
    pendingSessions: 0,
    completedSessions: 0,
    averageRating: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    weeklyEarnings: 0
  });
  
  const [todaySessions, setTodaySessions] = useState<TimelineSession[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<TimelineSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar dados do dashboard
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas
      const statsResponse = await api.get('/api/dashboard/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
      // Buscar sessões do usuário
      const sessionsResponse = await api.get('/api/sessions');
      if (sessionsResponse.data.success) {
        const sessions = sessionsResponse.data.data;
        
        // Filtrar sessões de hoje
        const today = new Date().toISOString().split('T')[0];
        const todaySessionsFiltered = sessions.filter((session: TimelineSession) => 
          session.scheduledDate === today
        ).sort((a: TimelineSession, b: TimelineSession) => 
          a.scheduledTime.localeCompare(b.scheduledTime)
        );
        
        // Filtrar próximas sessões (próximos 7 dias)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const upcomingSessionsFiltered = sessions.filter((session: TimelineSession) => {
          const sessionDate = new Date(session.scheduledDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return sessionDate > today && sessionDate <= nextWeek;
        }).sort((a: TimelineSession, b: TimelineSession) => {
          const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
          const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        setTodaySessions(todaySessionsFiltered);
        setUpcomingSessions(upcomingSessionsFiltered);
      }
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar dashboard:', error);
      // Não mostrar erro para o usuário, apenas log
    } finally {
      setLoading(false);
    }
  };

  // Refresh manual
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard atualizado!');
  };

  // Determinar se é cliente ou técnico
  const isClient = user?.role === 'CLIENT';
  const isTechnician = user?.role === 'TECHNICIAN' || user?.role === 'SERVICE_PROVIDER';

  // Mapear status para português
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Pendente',
      'CONFIRMED': 'Confirmada',
      'IN_PROGRESS': 'Em Andamento',
      'COMPLETED': 'Concluída',
      'CANCELLED': 'Cancelada',
      'REJECTED': 'Rejeitada'
    };
    return statusMap[status] || status;
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'bg-yellow-900/30 text-yellow-300 border-yellow-800',
      'CONFIRMED': 'bg-blue-900/30 text-blue-300 border-blue-800',
      'IN_PROGRESS': 'bg-green-900/30 text-green-300 border-green-800',
      'COMPLETED': 'bg-gray-900/30 text-gray-300 border-gray-800',
      'CANCELLED': 'bg-red-900/30 text-red-300 border-red-800',
      'REJECTED': 'bg-red-900/30 text-red-300 border-red-800'
    };
    return colorMap[status] || 'bg-gray-900/30 text-gray-300 border-gray-800';
  };

  // Obter cor da urgência
  const getUrgencyColor = (urgency: string) => {
    const colorMap: { [key: string]: string } = {
      'LOW': 'text-green-400',
      'MEDIUM': 'text-yellow-400',
      'HIGH': 'text-red-400'
    };
    return colorMap[urgency] || 'text-gray-400';
  };

  // Ação rápida baseada no status
  const getQuickAction = (session: TimelineSession) => {
    const userRole = getUserRole(session);
    
    if (userRole === 'technician') {
      if (session.status === 'PENDING') {
        return {
          label: 'Aceitar',
          icon: CheckCircle,
          color: 'bg-green-500 hover:bg-green-600',
          onClick: () => navigate(`/app/sessions/${session._id}`)
        };
      }
      if (session.status === 'CONFIRMED') {
        return {
          label: 'Iniciar',
          icon: Play,
          color: 'bg-blue-500 hover:bg-blue-600',
          onClick: () => navigate(`/app/sessions/${session._id}`)
        };
      }
      if (session.status === 'IN_PROGRESS') {
        return {
          label: 'Entrar',
          icon: Video,
          color: 'bg-green-500 hover:bg-green-600',
          onClick: () => navigate(`/call/${session._id}`)
        };
      }
    } else {
      if (session.status === 'IN_PROGRESS') {
        return {
          label: 'Entrar',
          icon: Video,
          color: 'bg-green-500 hover:bg-green-600',
          onClick: () => navigate(`/call/${session._id}`)
        };
      }
    }
    
    return {
      label: 'Ver Detalhes',
      icon: ChevronRight,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => navigate(`/app/sessions/${session._id}`)
    };
  };

  // Determinar papel do usuário na sessão
  const getUserRole = (session: TimelineSession): 'client' | 'technician' => {
    if (!user) return 'client';
    
    if (session.technicianId._id === user.id) return 'technician';
    if (session.clientId._id === user.id) return 'client';
    
    return isTechnician ? 'technician' : 'client';
  };

  // Obter participante da sessão
  const getOtherParticipant = (session: TimelineSession) => {
    const userRole = getUserRole(session);
    return userRole === 'client' ? session.technicianId : session.clientId;
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Olá, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400 mt-1">
            {isClient ? 'Gerencie suas solicitações de manutenção' : 'Gerencie seus atendimentos técnicos'}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
          
          {isClient && (
            <button
              onClick={() => navigate('/app/specialists')}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Sessão</span>
            </button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Sessões</p>
              <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
            </div>
            <Users className="w-8 h-8 text-primary-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                {isClient ? 'Sessões Ativas' : 'Pendentes'}
              </p>
              <p className="text-2xl font-bold text-white">
                {isClient ? stats.activeSessions : stats.pendingSessions}
              </p>
            </div>
            <Activity className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Concluídas</p>
              <p className="text-2xl font-bold text-white">{stats.completedSessions}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                {isClient ? 'Investido' : 'Ganhos'}
              </p>
              <p className="text-2xl font-bold text-white">
                R$ {isTechnician ? stats.totalEarnings.toFixed(2) : stats.totalEarnings.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sessões de Hoje */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Hoje ({todaySessions.length})
            </h2>
            <span className="text-gray-400 text-sm">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </span>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {todaySessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma sessão agendada para hoje</p>
                {isClient && (
                  <button
                    onClick={() => navigate('/app/specialists')}
                    className="mt-3 text-primary-400 hover:text-primary-300 text-sm"
                  >
                    Agendar nova sessão
                  </button>
                )}
              </div>
            ) : (
              todaySessions.map((session) => {
                const otherParticipant = getOtherParticipant(session);
                const quickAction = getQuickAction(session);
                const ActionIcon = quickAction.icon;

                return (
                  <div key={session._id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium">{session.scheduledTime}</span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(session.status)}`}>
                            {getStatusText(session.status)}
                          </span>
                        </div>
                        <h3 className="text-white font-medium mb-1">{session.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{session.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-400">
                            {getUserRole(session) === 'client' ? 'Técnico' : 'Cliente'}: {otherParticipant.name}
                          </span>
                          <span className={`${getUrgencyColor(session.urgency)}`}>
                            {session.urgency}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={quickAction.onClick}
                        className={`${quickAction.color} text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm transition-colors`}
                      >
                        <ActionIcon className="w-4 h-4" />
                        <span>{quickAction.label}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Próximas Sessões */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Próximas ({upcomingSessions.length})
            </h2>
            <button
              onClick={() => navigate('/app/sessions')}
              className="text-primary-400 hover:text-primary-300 text-sm flex items-center space-x-1"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Nenhuma sessão agendada</p>
                {isClient && (
                  <button
                    onClick={() => navigate('/app/specialists')}
                    className="mt-3 text-primary-400 hover:text-primary-300 text-sm"
                  >
                    Agendar nova sessão
                  </button>
                )}
              </div>
            ) : (
              upcomingSessions.map((session) => {
                const otherParticipant = getOtherParticipant(session);
                const sessionDate = new Date(session.scheduledDate);
                const quickAction = getQuickAction(session);
                const ActionIcon = quickAction.icon;

                return (
                  <div key={session._id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-white font-medium">
                            {sessionDate.toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })} às {session.scheduledTime}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(session.status)}`}>
                            {getStatusText(session.status)}
                          </span>
                        </div>
                        <h3 className="text-white font-medium mb-1">{session.title}</h3>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">{session.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-400">
                            {getUserRole(session) === 'client' ? 'Técnico' : 'Cliente'}: {otherParticipant.name}
                          </span>
                          <span className={`${getUrgencyColor(session.urgency)}`}>
                            {session.urgency}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={quickAction.onClick}
                        className={`${quickAction.color} text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm transition-colors`}
                      >
                        <ActionIcon className="w-4 h-4" />
                        <span>{quickAction.label}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isClient ? (
            <>
              <button
                onClick={() => navigate('/app/specialists')}
                className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-lg flex items-center space-x-3 transition-colors"
              >
                <Plus className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Agendar Sessão</p>
                  <p className="text-sm opacity-80">Encontrar especialista</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/app/sessions')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center space-x-3 transition-colors"
              >
                <Activity className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Minhas Sessões</p>
                  <p className="text-sm opacity-80">Ver histórico</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/app/profile')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center space-x-3 transition-colors"
              >
                <User className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Meu Perfil</p>
                  <p className="text-sm opacity-80">Configurações</p>
                </div>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/app/sessions')}
                className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-lg flex items-center space-x-3 transition-colors"
              >
                <Bell className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Solicitações</p>
                  <p className="text-sm opacity-80">{stats.pendingSessions} pendentes</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/app/sessions')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center space-x-3 transition-colors"
              >
                <Activity className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Meus Atendimentos</p>
                  <p className="text-sm opacity-80">Ver histórico</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/app/profile')}
                className="bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-lg flex items-center space-x-3 transition-colors"
              >
                <User className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-medium">Meu Perfil</p>
                  <p className="text-sm opacity-80">Especialidades</p>
                </div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
