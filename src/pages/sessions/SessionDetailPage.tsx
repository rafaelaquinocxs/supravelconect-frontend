import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface SessionDetail {
  _id: string;
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
    specialties: string[];
    rating: number;
    phone?: string;
  };
  title: string;
  description: string;
  specialty: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  issue: string;
  hourlyRate: number;
  estimatedCost: number;
  actualCost?: number;
  actualDuration?: number;
  startedAt?: string;
  endedAt?: string;
  resolution?: string;
  notes?: string;
  clientRating?: number;
  clientFeedback?: string;
  createdAt: string;
  updatedAt: string;
}

const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  // Carregar detalhes da sessão
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get(`/api/sessions/${id}`);
        setSession(response.data.data);
      } catch (error: any) {
        console.error('Erro ao carregar sessão:', error);
        toast.error('Erro ao carregar detalhes da sessão');
        navigate('/app/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSession();
    }
  }, [id, navigate]);

  // Aceitar/Rejeitar sessão (Técnico)
  const handleRespond = async (action: 'accept' | 'reject', message?: string) => {
    if (!session) return;
    
    setActionLoading(true);
    
    try {
      await api.post(`/api/sessions/${session._id}/respond`, {
        action,
        message
      });
      
      // Recarregar sessão
      const response = await api.get(`/api/sessions/${id}`);
      setSession(response.data.data);
      
      toast.success(`Sessão ${action === 'accept' ? 'aceita' : 'rejeitada'} com sucesso!`);
    } catch (error: any) {
      console.error('Erro ao responder sessão:', error);
      toast.error(error.response?.data?.message || 'Erro ao responder sessão');
    } finally {
      setActionLoading(false);
    }
  };

  // Iniciar sessão (Técnico)
  const handleStartSession = async () => {
    if (!session) return;
    
    setActionLoading(true);
    
    try {
      await api.post(`/api/sessions/${session._id}/start`);
      
      // Recarregar sessão
      const response = await api.get(`/api/sessions/${id}`);
      setSession(response.data.data);
      
      toast.success('Sessão iniciada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao iniciar sessão:', error);
      toast.error(error.response?.data?.message || 'Erro ao iniciar sessão');
    } finally {
      setActionLoading(false);
    }
  };

  // Finalizar sessão (Técnico)
  const handleEndSession = async (resolution: string, notes: string) => {
    if (!session) return;
    
    setActionLoading(true);
    
    try {
      await api.post(`/api/sessions/${session._id}/end`, {
        resolution,
        notes
      });
      
      // Recarregar sessão
      const response = await api.get(`/api/sessions/${id}`);
      setSession(response.data.data);
      
      toast.success('Sessão finalizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao finalizar sessão:', error);
      toast.error(error.response?.data?.message || 'Erro ao finalizar sessão');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancelar sessão
  const handleCancelSession = async (reason: string) => {
    if (!session) return;
    
    setActionLoading(true);
    
    try {
      await api.post(`/api/sessions/${session._id}/cancel`, {
        reason
      });
      
      // Recarregar sessão
      const response = await api.get(`/api/sessions/${id}`);
      setSession(response.data.data);
      
      toast.success('Sessão cancelada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao cancelar sessão:', error);
      toast.error(error.response?.data?.message || 'Erro ao cancelar sessão');
    } finally {
      setActionLoading(false);
    }
  };

  // Avaliar sessão (Cliente)
  const handleRateSession = async () => {
    if (!session) return;
    
    setActionLoading(true);
    
    try {
      await api.post(`/api/sessions/${session._id}/rating`, {
        rating,
        feedback
      });
      
      // Recarregar sessão
      const response = await api.get(`/api/sessions/${id}`);
      setSession(response.data.data);
      
      setShowRatingModal(false);
      toast.success('Avaliação enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao avaliar sessão:', error);
      toast.error(error.response?.data?.message || 'Erro ao enviar avaliação');
    } finally {
      setActionLoading(false);
    }
  };

  // Funções auxiliares
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900/30 text-yellow-300 border-yellow-800';
      case 'confirmed': return 'bg-blue-900/30 text-blue-300 border-blue-800';
      case 'in_progress': return 'bg-green-900/30 text-green-300 border-green-800';
      case 'completed': return 'bg-purple-900/30 text-purple-300 border-purple-800';
      case 'cancelled': return 'bg-red-900/30 text-red-300 border-red-800';
      case 'rejected': return 'bg-red-900/30 text-red-300 border-red-800';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando Resposta';
      case 'confirmed': return 'Confirmada';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      case 'rejected': return 'Rejeitada';
      default: return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-900/30 text-green-300 border-green-800';
      case 'medium': return 'bg-yellow-900/30 text-yellow-300 border-yellow-800';
      case 'high': return 'bg-red-900/30 text-red-300 border-red-800';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Sessão não encontrada</p>
      </div>
    );
  }

  const isTechnician = user?.role === 'technician';
  const isClient = user?.role === 'client';

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-400 hover:text-white mb-2"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h1 className="text-2xl font-bold text-white">{session.title}</h1>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
            {getStatusText(session.status)}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(session.urgency)}`}>
            {session.urgency === 'low' ? 'Baixa' : session.urgency === 'medium' ? 'Média' : 'Alta'} Urgência
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalhes da sessão */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Detalhes da Sessão</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Descrição</label>
                <p className="text-white">{session.description}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Problema Detalhado</label>
                <p className="text-white">{session.issue}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Especialidade</label>
                  <p className="text-white">{session.specialty}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Data Agendada</label>
                  <p className="text-white">{formatDate(session.scheduledDate)} às {session.scheduledTime}</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Duração Estimada</label>
                  <p className="text-white">{session.estimatedDuration} minutos</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Valor Estimado</label>
                  <p className="text-white">R$ {session.estimatedCost.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Resolução (se completada) */}
          {session.status === 'completed' && session.resolution && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Resolução</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Solução Aplicada</label>
                  <p className="text-white">{session.resolution}</p>
                </div>
                {session.notes && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Observações</label>
                    <p className="text-white">{session.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Duração Real</label>
                    <p className="text-white">{session.actualDuration} minutos</p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Valor Final</label>
                    <p className="text-white">R$ {session.actualCost?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Avaliação (se completada) */}
          {session.status === 'completed' && session.clientRating && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Avaliação do Cliente</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Nota:</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${star <= session.clientRating! ? 'text-yellow-400' : 'text-gray-600'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-2 text-white">{session.clientRating}/5</span>
                  </div>
                </div>
                {session.clientFeedback && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Comentário</label>
                    <p className="text-white">{session.clientFeedback}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações do participante */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              {isTechnician ? 'Cliente' : 'Técnico'}
            </h2>
            {(() => {
              const participant = isTechnician ? session.clientId : session.technicianId;
              return (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                      {participant.profileImage ? (
                        <img 
                          src={participant.profileImage} 
                          alt={participant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-300">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{participant.name}</p>
                      <p className="text-gray-400 text-sm">{participant.email}</p>
                    </div>
                  </div>
                  
                  {!isTechnician && (
                    <>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Especialidades</label>
                        <div className="flex flex-wrap gap-1">
                          {session.technicianId.specialties.map((specialty) => (
                            <span 
                              key={specialty}
                              className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-800"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Avaliação</label>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-white text-sm">{session.technicianId.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {participant.phone && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Telefone</label>
                      <p className="text-white text-sm">{participant.phone}</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Ações */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Ações</h2>
            <div className="space-y-3">
              {/* Ações do Técnico */}
              {isTechnician && session.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleRespond('accept')}
                    disabled={actionLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Aceitar Sessão
                  </button>
                  <button
                    onClick={() => handleRespond('reject')}
                    disabled={actionLoading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Rejeitar Sessão
                  </button>
                </>
              )}

              {isTechnician && session.status === 'confirmed' && (
                <button
                  onClick={handleStartSession}
                  disabled={actionLoading}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Iniciar Sessão
                </button>
              )}

              {session.status === 'in_progress' && (
                <button
                  onClick={() => navigate(`/app/sessions/${session._id}/call`)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Entrar na Chamada
                </button>
              )}

              {/* Ações do Cliente */}
              {isClient && session.status === 'completed' && !session.clientRating && (
                <button
                  onClick={() => setShowRatingModal(true)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Avaliar Sessão
                </button>
              )}

              {/* Ações gerais */}
              {['pending', 'confirmed'].includes(session.status) && (
                <button
                  onClick={() => handleCancelSession('Cancelado pelo usuário')}
                  disabled={actionLoading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancelar Sessão
                </button>
              )}
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Informações</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Criada em:</span>
                <span className="text-white ml-2">{formatDateTime(session.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-400">Atualizada em:</span>
                <span className="text-white ml-2">{formatDateTime(session.updatedAt)}</span>
              </div>
              {session.startedAt && (
                <div>
                  <span className="text-gray-400">Iniciada em:</span>
                  <span className="text-white ml-2">{formatDateTime(session.startedAt)}</span>
                </div>
              )}
              {session.endedAt && (
                <div>
                  <span className="text-gray-400">Finalizada em:</span>
                  <span className="text-white ml-2">{formatDateTime(session.endedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Avaliação */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Avaliar Sessão</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Nota (1-5 estrelas)</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'} hover:text-yellow-400 transition-colors`}
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Comentário (opcional)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Como foi sua experiência com o técnico?"
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRateSession}
                disabled={actionLoading}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {actionLoading ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetailPage;