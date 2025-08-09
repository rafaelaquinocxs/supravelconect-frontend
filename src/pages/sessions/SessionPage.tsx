import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface Session {
  id: string;
  requesterName: string;
  helperName: string;
  requesterAvatar?: string;
  helperAvatar?: string;
  specialty: string;
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'cancelled' | 'rejected';
  scheduledTime: string;
  startTime?: string;
  endTime?: string;
  description: string;
  problemType: string;
  urgency: 'low' | 'medium' | 'high';
  rating?: number;
  feedback?: string;
  cost: number;
  duration?: number;
  isRequester: boolean; // true se o usuário logado é quem pediu ajuda
}

const SessionsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'calls' | 'requests'>('calls');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/api/sessions');
      setSessions(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      
      // Dados mockados
      setSessions([
        // CHAMADOS - Pedidos que recebo (sou o especialista)
        {
          id: '1',
          requesterName: 'Pedro Santos',
          helperName: user?.name || 'Você',
          specialty: 'Elétrica',
          status: 'pending',
          scheduledTime: '2025-01-08T16:00:00Z',
          description: 'Empilhadeira Toyota não liga após troca de bateria. Display não acende.',
          problemType: 'Motor não liga',
          urgency: 'high',
          cost: 85,
          isRequester: false
        },
        {
          id: '2',
          requesterName: 'Ana Silva',
          helperName: user?.name || 'Você',
          specialty: 'Hidráulica',
          status: 'accepted',
          scheduledTime: '2025-01-08T14:30:00Z',
          description: 'Sistema hidráulico com vazamento no cilindro de elevação.',
          problemType: 'Problema hidráulico',
          urgency: 'medium',
          cost: 120,
          isRequester: false
        },
        {
          id: '3',
          requesterName: 'Carlos Oliveira',
          helperName: user?.name || 'Você',
          specialty: 'Motor',
          status: 'completed',
          scheduledTime: '2025-01-07T10:00:00Z',
          startTime: '2025-01-07T10:05:00Z',
          endTime: '2025-01-07T10:45:00Z',
          description: 'Motor diesel com perda de potência e fumaça excessiva.',
          problemType: 'Motor',
          urgency: 'medium',
          cost: 95,
          duration: 40,
          rating: 5,
          feedback: 'Excelente diagnóstico! Problema resolvido rapidamente.',
          isRequester: false
        },

        // MINHAS SOLICITAÇÕES - Pedidos que fiz (preciso de ajuda)
        {
          id: '4',
          requesterName: user?.name || 'Você',
          helperName: 'João Silva',
          specialty: 'Elétrica',
          status: 'active',
          scheduledTime: '2025-01-08T15:00:00Z',
          startTime: '2025-01-08T15:02:00Z',
          description: 'Problema no carregador de bateria, não está carregando completamente.',
          problemType: 'Carregador',
          urgency: 'high',
          cost: 75,
          isRequester: true
        },
        {
          id: '5',
          requesterName: user?.name || 'Você',
          helperName: 'Maria Santos',
          specialty: 'Hidráulica',
          status: 'pending',
          scheduledTime: '2025-01-09T09:00:00Z',
          description: 'Mastro não eleva completamente, para na metade do curso.',
          problemType: 'Mastro/Garfos',
          urgency: 'medium',
          cost: 110,
          isRequester: true
        },
        {
          id: '6',
          requesterName: user?.name || 'Você',
          helperName: 'Roberto Lima',
          specialty: 'Sistema elétrico',
          status: 'completed',
          scheduledTime: '2025-01-06T14:00:00Z',
          startTime: '2025-01-06T14:10:00Z',
          endTime: '2025-01-06T15:00:00Z',
          description: 'Luzes de trabalho não funcionam, problema no sistema elétrico.',
          problemType: 'Sistema elétrico',
          urgency: 'low',
          cost: 60,
          duration: 50,
          rating: 4,
          feedback: 'Bom atendimento, mas demorou um pouco para encontrar o problema.',
          isRequester: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCall = async (sessionId: string) => {
    try {
      await api.post(`/api/sessions/${sessionId}/accept`);
      toast.success('Chamado aceito!');
      fetchSessions();
    } catch (error) {
      toast.error('Erro ao aceitar chamado');
    }
  };

  const handleRejectCall = async (sessionId: string) => {
    try {
      await api.post(`/api/sessions/${sessionId}/reject`);
      toast.success('Chamado rejeitado');
      fetchSessions();
    } catch (error) {
      toast.error('Erro ao rejeitar chamado');
    }
  };

  const handleStartSession = async (sessionId: string) => {
    try {
      await api.post(`/api/sessions/${sessionId}/start`);
      toast.success('Sessão iniciada!');
      fetchSessions();
    } catch (error) {
      toast.error('Erro ao iniciar sessão');
    }
  };

  const handleCancelRequest = async (sessionId: string) => {
    try {
      await api.post(`/api/sessions/${sessionId}/cancel`);
      toast.success('Solicitação cancelada');
      fetchSessions();
    } catch (error) {
      toast.error('Erro ao cancelar solicitação');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/30 text-yellow-300 border-yellow-800';
      case 'accepted': return 'bg-blue-900/30 text-blue-300 border-blue-800';
      case 'active': return 'bg-green-900/30 text-green-300 border-green-800';
      case 'completed': return 'bg-gray-900/30 text-gray-300 border-gray-800';
      case 'cancelled': return 'bg-red-900/30 text-red-300 border-red-800';
      case 'rejected': return 'bg-red-900/30 text-red-300 border-red-800';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'accepted': return 'Aceito';
      case 'active': return 'Ativa';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'rejected': return 'Rejeitada';
      default: return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      default: return urgency;
    }
  };

  // Filtrar sessões baseado na aba ativa
  const filteredSessions = sessions.filter(session => {
    // Filtro por aba
    if (activeTab === 'calls' && session.isRequester) return false;
    if (activeTab === 'requests' && !session.isRequester) return false;
    
    // Filtro por status
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const getTabCounts = () => {
    const calls = sessions.filter(s => !s.isRequester);
    const requests = sessions.filter(s => s.isRequester);
    
    return {
      calls: calls.length,
      callsPending: calls.filter(s => s.status === 'pending').length,
      requests: requests.length,
      requestsPending: requests.filter(s => s.status === 'pending').length
    };
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
            onClick={() => setActiveTab('calls')}
            className={`flex-1 p-4 text-center transition-colors relative ${
              activeTab === 'calls'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            } rounded-l-lg`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium">Chamados</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                {counts.calls}
              </span>
              {counts.callsPending > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {counts.callsPending}
                </span>
              )}
            </div>
            <p className="text-xs mt-1 opacity-75">Pedidos que você recebe</p>
          </button>
          
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 p-4 text-center transition-colors relative ${
              activeTab === 'requests'
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            } rounded-r-lg`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Minhas Solicitações</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                {counts.requests}
              </span>
              {counts.requestsPending > 0 && (
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  {counts.requestsPending}
                </span>
              )}
            </div>
            <p className="text-xs mt-1 opacity-75">Pedidos que você fez</p>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 mb-8 border border-gray-700">
        <div className="flex space-x-4">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'pending', label: 'Pendentes' },
            { key: 'active', label: 'Ativas' },
            { key: 'completed', label: 'Concluídas' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === filterOption.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-6">
        {filteredSessions.map((session) => (
          <div key={session.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {session.isRequester 
                      ? session.helperName.charAt(0)
                      : session.requesterName.charAt(0)
                    }
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {session.isRequester ? session.helperName : session.requesterName}
                  </h3>
                  <p className="text-gray-400">{session.specialty}</p>
                  <p className="text-gray-500 text-sm">
                    {session.isRequester ? 'Especialista' : 'Solicitante'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(session.status)}`}>
                  {getStatusText(session.status)}
                </span>
                <span className={`text-sm ${getUrgencyColor(session.urgency)}`}>
                  {session.urgency === 'low' ? '🟢' : session.urgency === 'medium' ? '🟡' : '🔴'}
                  {getUrgencyText(session.urgency)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-4 mb-2">
                <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">
                  {session.problemType}
                </span>
                <span className="text-gray-400 text-sm">
                  R$ {session.cost}
                </span>
              </div>
              <p className="text-gray-300 mb-3">{session.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Agendado:</span>
                  <p className="text-white">{formatDate(session.scheduledTime)}</p>
                </div>
                {session.startTime && (
                  <div>
                    <span className="text-gray-400">Iniciado:</span>
                    <p className="text-white">{formatDate(session.startTime)}</p>
                  </div>
                )}
                {session.duration && (
                  <div>
                    <span className="text-gray-400">Duração:</span>
                    <p className="text-white">{session.duration} min</p>
                  </div>
                )}
                {session.endTime && (
                  <div>
                    <span className="text-gray-400">Finalizado:</span>
                    <p className="text-white">{formatDate(session.endTime)}</p>
                  </div>
                )}
              </div>
            </div>

            {session.rating && session.feedback && (
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-400">
                    {'★'.repeat(session.rating)}{'☆'.repeat(5 - session.rating)}
                  </span>
                  <span className="text-gray-400 text-sm">Avaliação</span>
                </div>
                <p className="text-gray-300 text-sm italic">"{session.feedback}"</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              {/* Ações para CHAMADOS (sou o especialista) */}
              {!session.isRequester && (
                <>
                  {session.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptCall(session.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleRejectCall(session.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Rejeitar
                      </button>
                    </>
                  )}
                  
                  {session.status === 'accepted' && (
                    <button
                      onClick={() => handleStartSession(session.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Iniciar Sessão
                    </button>
                  )}
                  
                  {session.status === 'active' && (
                    <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                      🎥 Entrar na Chamada
                    </button>
                  )}
                </>
              )}

              {/* Ações para SOLICITAÇÕES (sou o solicitante) */}
              {session.isRequester && (
                <>
                  {session.status === 'pending' && (
                    <button
                      onClick={() => handleCancelRequest(session.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  
                  {session.status === 'active' && (
                    <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors font-medium">
                      🎥 Entrar na Chamada
                    </button>
                  )}
                  
                  {session.status === 'completed' && !session.rating && (
                    <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">
                      Avaliar Sessão
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Estado vazio */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            {activeTab === 'calls' 
              ? 'Nenhum chamado encontrado'
              : 'Nenhuma solicitação encontrada'
            }
          </div>
          <p className="text-gray-500 mb-6">
            {activeTab === 'calls'
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
          {activeTab === 'requests' && (
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
              Encontrar Especialista
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;