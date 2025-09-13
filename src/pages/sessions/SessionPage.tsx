import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star,
  Calendar,
  User,
  Phone,
  MessageCircle,
  Filter,
  Search,
  Play,
  Pause,
  MoreVertical,
  Plus,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface Session {
  _id: string;
  title: string;
  description: string;
  specialty: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  clientId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    phone?: string;
  };
  technicianId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
    phone?: string;
    rating?: number;
  };
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  hourlyRate: number;
  estimatedCost: number;
  actualCost?: number;
  actualDuration?: number;
  startedAt?: string;
  endedAt?: string;
  clientRating?: number;
  clientFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'requested'>('received');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      console.log('🔍 Buscando sessões...');
      
      const response = await api.get('/api/sessions');
      console.log('✅ Sessões carregadas:', response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        setSessions(response.data.data);
      } else {
        console.warn('⚠️ Formato de resposta inesperado:', response.data);
        setSessions([]);
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar sessões:', error);
      toast.error('Erro ao carregar sessões');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Determinar se o usuário é cliente ou técnico na sessão
  const getUserRole = (session: Session): 'client' | 'technician' => {
    return session.clientId._id === user?.id ? 'client' : 'technician';
  };

  // Obter dados da outra parte (cliente ou técnico)
  const getOtherParticipant = (session: Session) => {
    const userRole = getUserRole(session);
    return userRole === 'client' ? session.technicianId : session.clientId;
  };

  // Filtrar sessões baseado na aba ativa
  const filteredSessions = sessions.filter(session => {
    const userRole = getUserRole(session);
    
    // Filtro por aba
    if (activeTab === 'received' && userRole !== 'technician') return false;
    if (activeTab === 'requested' && userRole !== 'client') return false;
    
    // Filtro por status
    if (filter === 'all') return true;
    return session.status.toLowerCase() === filter.toLowerCase();
  });

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

  // Mapear urgência para português
  const getUrgencyText = (urgency: string) => {
    const urgencyMap: { [key: string]: string } = {
      'LOW': 'Baixa',
      'MEDIUM': 'Média',
      'HIGH': 'Alta'
    };
    return urgencyMap[urgency] || urgency;
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

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==================== AÇÕES ====================

  const handleViewDetails = (sessionId: string) => {
    console.log('🔍 Navegando para detalhes da sessão:', sessionId);
    navigate(`/app/sessions/${sessionId}`);
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      console.log('❌ Cancelando sessão:', sessionId);
      
      const response = await api.post(`/api/sessions/${sessionId}/cancel`, {
        reason: 'Cancelado pelo usuário'
      });

      if (response.data.success) {
        toast.success('Sessão cancelada com sucesso');
        // Atualizar a lista de sessões
        await fetchSessions();
      }
    } catch (error: any) {
      console.error('❌ Erro ao cancelar sessão:', error);
      toast.error('Erro ao cancelar sessão');
    }
  };

  const handleAcceptSession = async (sessionId: string) => {
    try {
      console.log('✅ Aceitando sessão:', sessionId);
      
      const response = await api.post(`/api/sessions/${sessionId}/respond`, {
        action: 'accept',
        message: 'Sessão aceita'
      });

      if (response.data.success) {
        toast.success('Sessão aceita com sucesso');
        await fetchSessions();
      }
    } catch (error: any) {
      console.error('❌ Erro ao aceitar sessão:', error);
      toast.error('Erro ao aceitar sessão');
    }
  };

  const handleRejectSession = async (sessionId: string) => {
    try {
      console.log('❌ Rejeitando sessão:', sessionId);
      
      const response = await api.post(`/api/sessions/${sessionId}/respond`, {
        action: 'reject',
        message: 'Sessão rejeitada'
      });

      if (response.data.success) {
        toast.success('Sessão rejeitada');
        await fetchSessions();
      }
    } catch (error: any) {
      console.error('❌ Erro ao rejeitar sessão:', error);
      toast.error('Erro ao rejeitar sessão');
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      console.log('▶️ Iniciando sessão:', sessionId);
      
      const response = await api.post(`/api/sessions/${sessionId}/start`);

      if (response.data.success) {
        toast.success('Sessão iniciada');
        await fetchSessions();
      }
    } catch (error: any) {
      console.error('❌ Erro ao iniciar sessão:', error);
      toast.error('Erro ao iniciar sessão');
    }
  };

  // Obter contadores das abas
  const getTabCounts = () => {
    const received = sessions.filter(s => getUserRole(s) === 'technician').length;
    const requested = sessions.filter(s => getUserRole(s) === 'client').length;
    const receivedPending = sessions.filter(s => getUserRole(s) === 'technician' && s.status === 'PENDING').length;
    const requestedPending = sessions.filter(s => getUserRole(s) === 'client' && s.status === 'PENDING').length;
    
    return { received, requested, receivedPending, requestedPending };
  };

  const counts = getTabCounts();

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
        <h1 className="text-3xl font-bold text-white mb-2">Sessões</h1>
        <p className="text-gray-400">
          Gerencie chamados que você recebe e suas solicitações de ajuda
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
        <div className="flex">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 p-4 text-center transition-colors relative ${
              activeTab === 'received'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            } rounded-l-lg`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Phone className="w-5 h-5" />
              <span className="font-medium">Chamados</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                {counts.received}
              </span>
              {counts.receivedPending > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {counts.receivedPending}
                </span>
              )}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('requested')}
            className={`flex-1 p-4 text-center transition-colors relative ${
              activeTab === 'requested'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            } rounded-r-lg`}
          >
            <div className="flex items-center justify-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Minhas Solicitações</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                {counts.requested}
              </span>
              {counts.requestedPending > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {counts.requestedPending}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Pingentes
        </button>
        <button
          onClick={() => setFilter('confirmed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'confirmed'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Confirmadas
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'in_progress'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Em Andamento
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Concluídas
        </button>
      </div>

      {/* Lista de Sessões */}
      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const userRole = getUserRole(session);
          const otherParticipant = getOtherParticipant(session);
          
          return (
            <div key={session._id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              {/* Header da Sessão */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {otherParticipant.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{otherParticipant.name}</h3>
                    <p className="text-gray-400 text-sm">{session.specialty}</p>
                    <p className="text-gray-500 text-sm">
                      {userRole === 'client' ? 'Especialista' : 'Cliente'}
                    </p>
                  </div>
                </div>
                
                {/* Status e Urgência */}
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                    {getStatusText(session.status)}
                  </span>
                  <span className={`text-sm font-medium ${getUrgencyColor(session.urgency)}`}>
                    {getUrgencyText(session.urgency)}
                  </span>
                </div>
              </div>

              {/* Título e Descrição */}
              <div className="mb-4">
                <h4 className="text-white font-medium mb-2">{session.title}</h4>
                <p className="text-gray-300 text-sm">{session.description}</p>
              </div>

              {/* Detalhes da Sessão */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-400">Agendado:</span>
                  <p className="text-white">
                    {new Date(session.scheduledDate).toLocaleDateString('pt-BR')} às {session.scheduledTime}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400">Duração:</span>
                  <p className="text-white">{session.estimatedDuration} min</p>
                </div>
                <div>
                  <span className="text-gray-400">Valor:</span>
                  <p className="text-white">R$ {session.estimatedCost.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Criado:</span>
                  <p className="text-white">{formatDate(session.createdAt)}</p>
                </div>
              </div>

              {/* Avaliação (se existir) */}
              {session.clientRating && session.clientFeedback && (
                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-yellow-400">
                      {'★'.repeat(session.clientRating)}{'☆'.repeat(5 - session.clientRating)}
                    </span>
                    <span className="text-gray-400 text-sm">Avaliação do Cliente</span>
                  </div>
                  <p className="text-gray-300 text-sm italic">"{session.clientFeedback}"</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-wrap gap-3">
                {/* Ações para CHAMADOS (sou o técnico) */}
                {userRole === 'technician' && (
                  <>
                    {session.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAcceptSession(session._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => handleRejectSession(session._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                        >
                          Rejeitar
                        </button>
                      </>
                    )}
                    
                    {session.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStartSession(session._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        Iniciar Sessão
                      </button>
                    )}
                    
                    {session.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => navigate(`/call/${session._id}`)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        🎥 Entrar na Chamada
                      </button>
                    )}
                  </>
                )}

                {/* Ações para SOLICITAÇÕES (sou o cliente) */}
                {userRole === 'client' && (
                  <>
                    {session.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelSession(session._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                    )}
                    
                    {session.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => navigate(`/call/${session._id}`)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        🎥 Entrar na Chamada
                      </button>
                    )}
                    
                    {session.status === 'COMPLETED' && !session.clientRating && (
                      <button
                        onClick={() => toast.info('Funcionalidade de avaliação em desenvolvimento')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        Avaliar
                      </button>
                    )}
                  </>
                )}

                {/* Botão Ver Detalhes - Sempre disponível */}
                <button
                  onClick={() => handleViewDetails(session._id)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado vazio */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            {activeTab === 'received' 
              ? 'Nenhum chamado encontrado'
              : 'Nenhuma solicitação encontrada'
            }
          </div>
          <p className="text-gray-500 mb-6">
            {activeTab === 'received'
              ? 'Chamados de outros usuários aparecerão aqui quando precisarem da sua especialidade'
              : 'Suas solicitações de ajuda aparecerão aqui quando você agendar uma sessão'
            }
          </p>
          <button
            onClick={() => setFilter('all')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg mr-4"
          >
            Ver Todas
          </button>
          {activeTab === 'requested' && (
            <button 
              onClick={() => navigate('/app/specialists')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
            >
              Encontrar Especialista
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
