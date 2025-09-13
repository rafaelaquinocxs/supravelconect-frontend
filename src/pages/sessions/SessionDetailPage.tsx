import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Wrench, 
  MapPin, 
  Phone, 
  MessageCircle,
  CheckCircle,
  XCircle,
  Play,
  Video,
  Square,
  Star,
  User,
  Clock,
  DollarSign,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface SessionData {
  _id: string;
  title: string;
  description: string;
  issue?: string;
  location?: string;
  contactPreference?: string;
  additionalNotes?: string;
  clientId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  technicianId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  specialty: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  estimatedCost: number;
  resolution?: string;
  notes?: string;
  clientRating?: number;
  clientFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      try {
        console.log('🔍 Carregando sessão:', id);
        const response = await api.get(`/api/sessions/${id}`);
        
        if (response.data.success) {
          const sessionData = response.data.data;
          console.log('✅ Sessão carregada:', sessionData);
          setSession(sessionData);
        } else {
          toast.error('Sessão não encontrada');
          navigate('/app/sessions');
        }
      } catch (error: any) {
        console.error('❌ Erro ao carregar sessão:', error);
        toast.error('Erro ao carregar sessão');
        navigate('/app/sessions');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSession();
    }
  }, [id, navigate]);

  // Determinar se o usuário é cliente ou técnico
  const getUserRole = (): 'client' | 'technician' => {
    if (!session || !user) {
      console.log('⚠️ Sessão ou usuário não carregados ainda');
      return 'client';
    }
    
    console.log('🔍 Determinando role do usuário:', {
      userId: user.id,
      clientId: session.clientId._id,
      technicianId: session.technicianId._id,
      userRole: user.role
    });
    
    // Verificar se é o técnico da sessão
    if (session.technicianId._id === user.id) {
      console.log('✅ Usuário é o TÉCNICO da sessão');
      return 'technician';
    }
    
    // Verificar se é o cliente da sessão
    if (session.clientId._id === user.id) {
      console.log('✅ Usuário é o CLIENTE da sessão');
      return 'client';
    }
    
    // Fallback baseado no role do usuário
    if (user.role === 'TECHNICIAN' || user.role === 'SERVICE_PROVIDER') {
      console.log('✅ Usuário tem role de TÉCNICO');
      return 'technician';
    }
    
    console.log('✅ Usuário é CLIENTE (fallback)');
    return 'client';
  };

  // Obter dados da outra parte
  const getOtherParticipant = () => {
    if (!session) return null;
    const userRole = getUserRole();
    return userRole === 'client' ? session.technicianId : session.clientId;
  };

  // Aceitar/Rejeitar sessão (Técnico)
  const handleRespond = async (action: 'accept' | 'reject') => {
    if (!session) return;
    
    setActionLoading(true);
    try {
      console.log(`🔄 ${action === 'accept' ? 'Aceitando' : 'Rejeitando'} sessão:`, session._id);
      
      const response = await api.post(`/api/sessions/${session._id}/respond`, {
        action: action
      });

      if (response.data.success) {
        const newStatus = action === 'accept' ? 'CONFIRMED' : 'REJECTED';
        setSession(prev => prev ? { ...prev, status: newStatus } : null);
        
        toast.success(action === 'accept' ? 'Sessão aceita com sucesso!' : 'Sessão rejeitada');
        
        // Recarregar a página para atualizar todos os dados
        window.location.reload();
      } else {
        toast.error('Erro ao processar resposta');
      }
    } catch (error: any) {
      console.error('❌ Erro ao responder sessão:', error);
      toast.error('Erro ao processar resposta: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Iniciar sessão (Técnico)
  const handleStartSession = async () => {
    if (!session) return;
    
    setActionLoading(true);
    try {
      console.log('🚀 Iniciando sessão:', session._id);
      
      const response = await api.post(`/api/sessions/${session._id}/start`);

      if (response.data.success) {
        setSession(prev => prev ? { ...prev, status: 'IN_PROGRESS' } : null);
        toast.success('Sessão iniciada! Agora vocês podem entrar na videochamada.');
        
        // Recarregar a página para atualizar todos os dados
        window.location.reload();
      } else {
        toast.error('Erro ao iniciar sessão');
      }
    } catch (error: any) {
      console.error('❌ Erro ao iniciar sessão:', error);
      toast.error('Erro ao iniciar sessão: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Finalizar sessão (Técnico)
  const handleEndSession = async () => {
    if (!session) return;
    
    setActionLoading(true);
    try {
      console.log('🏁 Finalizando sessão:', session._id);
      
      const response = await api.post(`/api/sessions/${session._id}/end`);

      if (response.data.success) {
        setSession(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
        toast.success('Sessão finalizada com sucesso!');
        
        // Recarregar a página para atualizar todos os dados
        window.location.reload();
      } else {
        toast.error('Erro ao finalizar sessão');
      }
    } catch (error: any) {
      console.error('❌ Erro ao finalizar sessão:', error);
      toast.error('Erro ao finalizar sessão: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Cancelar sessão (Cliente)
  const handleCancelSession = async () => {
    if (!session) return;
    
    if (!confirm('Tem certeza que deseja cancelar esta sessão?')) return;
    
    setActionLoading(true);
    try {
      console.log('❌ Cancelando sessão:', session._id);
      
      const response = await api.post(`/api/sessions/${session._id}/cancel`);

      if (response.data.success) {
        setSession(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
        toast.success('Sessão cancelada');
        
        // Recarregar a página para atualizar todos os dados
        window.location.reload();
      } else {
        toast.error('Erro ao cancelar sessão');
      }
    } catch (error: any) {
      console.error('❌ Erro ao cancelar sessão:', error);
      toast.error('Erro ao cancelar sessão: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Entrar na videochamada
  const handleJoinCall = () => {
    if (!session) return;
    
    // Navegar para página de videochamada
    navigate(`/call/${session._id}`);
  };

  // Avaliar sessão (Cliente)
  const handleRateSession = async () => {
    if (!session || rating === 0) return;
    
    setActionLoading(true);
    try {
      console.log('⭐ Avaliando sessão:', session._id, { rating, feedback });
      
      const response = await api.post(`/api/sessions/${session._id}/rate`, {
        rating,
        feedback
      });

      if (response.data.success) {
        setSession(prev => prev ? { 
          ...prev, 
          clientRating: rating, 
          clientFeedback: feedback 
        } : null);
        
        toast.success('Avaliação enviada com sucesso!');
        setShowRatingModal(false);
        setRating(0);
        setFeedback('');
      } else {
        toast.error('Erro ao enviar avaliação');
      }
    } catch (error: any) {
      console.error('❌ Erro ao avaliar sessão:', error);
      toast.error('Erro ao enviar avaliação: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(false);
    }
  };

  // Funções de formatação
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 bg-opacity-20 text-yellow-300 border-yellow-500';
      case 'CONFIRMED': return 'bg-blue-500 bg-opacity-20 text-blue-300 border-blue-500';
      case 'IN_PROGRESS': return 'bg-green-500 bg-opacity-20 text-green-300 border-green-500';
      case 'COMPLETED': return 'bg-gray-500 bg-opacity-20 text-gray-300 border-gray-500';
      case 'CANCELLED': return 'bg-red-500 bg-opacity-20 text-red-300 border-red-500';
      case 'REJECTED': return 'bg-red-500 bg-opacity-20 text-red-300 border-red-500';
      default: return 'bg-gray-500 bg-opacity-20 text-gray-300 border-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'CONFIRMED': return 'Confirmada';
      case 'IN_PROGRESS': return 'Em Andamento';
      case 'COMPLETED': return 'Concluída';
      case 'CANCELLED': return 'Cancelada';
      case 'REJECTED': return 'Rejeitada';
      default: return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'LOW': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'HIGH': return 'Alta';
      case 'MEDIUM': return 'Média';
      case 'LOW': return 'Baixa';
      default: return urgency;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Sessão não encontrada</h2>
          <button
            onClick={() => navigate('/app/sessions')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
          >
            Voltar para Sessões
          </button>
        </div>
      </div>
    );
  }

  const userRole = getUserRole();
  const otherParticipant = getOtherParticipant();

  console.log('🎯 Renderizando SessionDetailPage:', {
    userRole,
    sessionStatus: session.status,
    userId: user?.id,
    sessionId: session._id
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/app/sessions')}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Detalhes da Sessão</h1>
          <p className="text-gray-400">#{session._id.slice(-8)}</p>
        </div>
      </div>

      {/* Status e Urgência */}
      <div className="flex items-center space-x-4 mb-8">
        <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(session.status)}`}>
          {getStatusText(session.status)}
        </span>
        <span className={`text-sm font-medium ${getUrgencyColor(session.urgency)}`}>
          Urgência: {getUrgencyText(session.urgency)}
        </span>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* ========== INFORMAÇÕES BÁSICAS ========== */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Informações da Sessão
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Título</label>
              <p className="text-white font-medium">{session.title}</p>
            </div>
            
            <div>
              <label className="text-gray-400 text-sm">Descrição</label>
              <p className="text-white">{session.description}</p>
            </div>
            
            <div>
              <label className="text-gray-400 text-sm">Especialidade</label>
              <p className="text-white">{session.specialty}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Agenda de Dados</label>
                <p className="text-white">{new Date(session.scheduledDate).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Horário</label>
                <p className="text-white">{session.scheduledTime}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Duração Estimada</label>
                <p className="text-white">{session.estimatedDuration} minutos</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Valor Estimado</label>
                <p className="text-white">R$ {session.estimatedCost.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========== DETALHES TÉCNICOS ========== */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Wrench className="w-5 h-5 mr-2" />
            Detalhes do Problema
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">Descrição Detalhada</label>
              <p className="text-white">{session.issue || 'Não informado'}</p>
            </div>
            
            {session.location && (
              <div>
                <label className="text-gray-400 text-sm flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Local
                </label>
                <p className="text-white">{session.location}</p>
              </div>
            )}
            
            {session.contactPreference && (
              <div>
                <label className="text-gray-400 text-sm flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  Preferência de Contato
                </label>
                <p className="text-white">{session.contactPreference}</p>
              </div>
            )}
            
            {session.additionalNotes && (
              <div>
                <label className="text-gray-400 text-sm flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Observações Adicionais
                </label>
                <p className="text-white">{session.additionalNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* ========== DADOS DO PARTICIPANTE ========== */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {userRole === 'client' ? 'Técnico' : 'Cliente'}
          </h2>
          
          {otherParticipant && (
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {otherParticipant.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-white font-semibold">{otherParticipant.name}</h3>
                <p className="text-gray-400">{otherParticipant.email}</p>
                {otherParticipant.phone && (
                  <p className="text-gray-400">{otherParticipant.phone}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========== HISTÓRICO E RESOLUÇÃO ========== */}
        {(session.resolution || session.notes || session.clientFeedback) && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Histórico</h2>
            
            <div className="space-y-4">
              {session.resolution && (
                <div>
                  <label className="text-gray-400 text-sm">Resolução</label>
                  <p className="text-white">{session.resolution}</p>
                </div>
              )}
              
              {session.notes && (
                <div>
                  <label className="text-gray-400 text-sm">Observações do Técnico</label>
                  <p className="text-white">{session.notes}</p>
                </div>
              )}
              
              {session.clientFeedback && (
                <div>
                  <label className="text-gray-400 text-sm">Feedback do Cliente</label>
                  <div className="flex items-center space-x-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (session.clientRating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-white">{session.clientRating}/5</span>
                  </div>
                  <p className="text-white">{session.clientFeedback}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========== BOTÕES DE AÇÃO ========== */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* AÇÕES PARA TÉCNICO */}
        {userRole === 'technician' && (
          <>
            {session.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleRespond('accept')}
                  disabled={actionLoading}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  <span>Aceitar Sessão</span>
                </button>
                <button
                  onClick={() => handleRespond('reject')}
                  disabled={actionLoading}
                  className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  <span>Rejeitar Sessão</span>
                </button>
              </>
            )}

            {session.status === 'CONFIRMED' && (
              <button
                onClick={handleStartSession}
                disabled={actionLoading}
                className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                <span>Iniciar Sessão</span>
              </button>
            )}

            {session.status === 'IN_PROGRESS' && (
              <>
                <button
                  onClick={handleJoinCall}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Video className="w-5 h-5" />
                  <span>Entrar na Chamada</span>
                </button>
                <button
                  onClick={handleEndSession}
                  disabled={actionLoading}
                  className="bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5" />}
                  <span>Finalizar Sessão</span>
                </button>
              </>
            )}
          </>
        )}

        {/* AÇÕES PARA CLIENTE */}
        {userRole === 'client' && (
          <>
            {session.status === 'PENDING' && (
              <button
                onClick={handleCancelSession}
                disabled={actionLoading}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {actionLoading ? <Loader className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                <span>Cancelar Sessão</span>
              </button>
            )}

            {session.status === 'IN_PROGRESS' && (
              <button
                onClick={handleJoinCall}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Video className="w-5 h-5" />
                <span>Entrar na Chamada</span>
              </button>
            )}

            {session.status === 'COMPLETED' && !session.clientRating && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Star className="w-5 h-5" />
                <span>Avaliar Sessão</span>
              </button>
            )}
          </>
        )}

        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/app/sessions')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para Sessões</span>
        </button>
      </div>

      {/* Modal de Avaliação */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Avaliar Sessão</h3>
            
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Avaliação</label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-600'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="w-full h-full fill-current" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-2 block">Comentário (opcional)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Conte como foi sua experiência..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleRateSession}
                disabled={rating === 0 || actionLoading}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white py-2 rounded-lg transition-colors"
              >
                {actionLoading ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetailPage;
