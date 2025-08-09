import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  credits?: number;
  commission?: number;
}

interface UserSubscription {
  id: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  plan: SubscriptionPlan;
  autoRenew: boolean;
  nextBillingDate?: string;
  paymentMethod?: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  paymentMethod: string;
}

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Carregar dados da assinatura
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansResponse, subscriptionResponse, historyResponse] = await Promise.all([
          api.get('/api/subscriptions/plans'),
          api.get('/api/subscriptions/current'),
          api.get('/api/subscriptions/payment-history')
        ]);
        
        setPlans(plansResponse.data.data);
        setCurrentSubscription(subscriptionResponse.data.data);
        setPaymentHistory(historyResponse.data.data);
      } catch (error) {
        console.error('Erro ao carregar dados da assinatura:', error);
        toast.error('Erro ao carregar informações da assinatura');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Assinar plano
  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    
    try {
      const response = await api.post('/api/subscriptions/subscribe', {
        planId
      });
      
      // Redirecionar para pagamento
      if (response.data.data.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      }
    } catch (error: any) {
      console.error('Erro ao assinar:', error);
      toast.error(error.response?.data?.message || 'Erro ao processar assinatura');
    } finally {
      setSubscribing(null);
    }
  };

  // Cancelar assinatura
  const handleCancelSubscription = async () => {
    if (!currentSubscription || !cancelReason.trim()) {
      toast.error('Por favor, informe o motivo do cancelamento');
      return;
    }
    
    try {
      await api.post('/api/subscriptions/cancel', {
        reason: cancelReason
      });
      
      // Recarregar dados
      const response = await api.get('/api/subscriptions/current');
      setCurrentSubscription(response.data.data);
      
      setShowCancelModal(false);
      setCancelReason('');
      toast.success('Assinatura cancelada com sucesso');
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      toast.error(error.response?.data?.message || 'Erro ao cancelar assinatura');
    }
  };

  // Reativar assinatura
  const handleReactivateSubscription = async () => {
    try {
      await api.post('/api/subscriptions/reactivate');
      
      // Recarregar dados
      const response = await api.get('/api/subscriptions/current');
      setCurrentSubscription(response.data.data);
      
      toast.success('Assinatura reativada com sucesso');
    } catch (error: any) {
      console.error('Erro ao reativar assinatura:', error);
      toast.error(error.response?.data?.message || 'Erro ao reativar assinatura');
    }
  };

  // Alterar renovação automática
  const handleToggleAutoRenew = async () => {
    if (!currentSubscription) return;
    
    try {
      await api.post('/api/subscriptions/auto-renew', {
        autoRenew: !currentSubscription.autoRenew
      });
      
      // Recarregar dados
      const response = await api.get('/api/subscriptions/current');
      setCurrentSubscription(response.data.data);
      
      toast.success(`Renovação automática ${!currentSubscription.autoRenew ? 'ativada' : 'desativada'}`);
    } catch (error: any) {
      console.error('Erro ao alterar renovação automática:', error);
      toast.error('Erro ao alterar configuração');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/30 text-green-300 border-green-800';
      case 'cancelled': return 'bg-red-900/30 text-red-300 border-red-800';
      case 'expired': return 'bg-gray-900/30 text-gray-300 border-gray-800';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'cancelled': return 'Cancelada';
      case 'expired': return 'Expirada';
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
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Gerenciar Assinatura</h1>

      {/* Assinatura Atual */}
      {currentSubscription ? (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Assinatura Atual</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentSubscription.status)}`}>
              {getStatusText(currentSubscription.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Plano</label>
              <p className="text-white font-medium">{currentSubscription.plan.name}</p>
              <p className="text-gray-400 text-sm">{currentSubscription.plan.description}</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Valor Mensal</label>
              <p className="text-white font-medium">R$ {currentSubscription.plan.price.toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Período</label>
              <p className="text-white">{formatDate(currentSubscription.startDate)}</p>
              <p className="text-gray-400 text-sm">até {formatDate(currentSubscription.endDate)}</p>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Próxima Cobrança</label>
              <p className="text-white">
                {currentSubscription.nextBillingDate ? formatDate(currentSubscription.nextBillingDate) : 'N/A'}
              </p>
              <p className="text-gray-400 text-sm">
                Renovação: {currentSubscription.autoRenew ? 'Automática' : 'Manual'}
              </p>
            </div>
          </div>

          {/* Recursos do plano atual */}
          <div className="mt-6">
            <label className="block text-gray-400 text-sm mb-2">Recursos Inclusos</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentSubscription.plan.features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-3 mt-6">
            {currentSubscription.status === 'active' && (
              <>
                <button
                  onClick={handleToggleAutoRenew}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {currentSubscription.autoRenew ? 'Desativar' : 'Ativar'} Renovação Automática
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancelar Assinatura
                </button>
              </>
            )}
            {currentSubscription.status === 'cancelled' && (
              <button
                onClick={handleReactivateSubscription}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Reativar Assinatura
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Nenhuma Assinatura Ativa</h2>
          <p className="text-gray-400 mb-4">Escolha um plano abaixo para começar</p>
        </div>
      )}

      {/* Planos Disponíveis */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          {currentSubscription ? 'Alterar Plano' : 'Escolher Plano'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-gray-800 rounded-lg p-6 border-2 transition-colors ${
                plan.isPopular 
                  ? 'border-primary-500' 
                  : currentSubscription?.planId === plan.id
                  ? 'border-green-500'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {plan.isPopular && (
                <div className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                  MAIS POPULAR
                </div>
              )}
              {currentSubscription?.planId === plan.id && (
                <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                  PLANO ATUAL
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
              
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">R$ {plan.price.toFixed(2)}</span>
                <span className="text-gray-400">/mês</span>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={subscribing === plan.id || currentSubscription?.planId === plan.id}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  currentSubscription?.planId === plan.id
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : subscribing === plan.id
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : plan.isPopular
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {subscribing === plan.id ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : currentSubscription?.planId === plan.id ? (
                  'Plano Atual'
                ) : currentSubscription ? (
                  'Alterar para este Plano'
                ) : (
                  'Escolher Plano'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      {paymentHistory.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Histórico de Pagamentos</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 py-2">Data</th>
                  <th className="text-left text-gray-400 py-2">Descrição</th>
                  <th className="text-left text-gray-400 py-2">Método</th>
                  <th className="text-left text-gray-400 py-2">Valor</th>
                  <th className="text-left text-gray-400 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-700">
                    <td className="text-white py-3">{formatDate(payment.date)}</td>
                    <td className="text-white py-3">{payment.description}</td>
                    <td className="text-gray-400 py-3">{payment.paymentMethod}</td>
                    <td className="text-white py-3">R$ {payment.amount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'paid' 
                          ? 'bg-green-900/30 text-green-300'
                          : payment.status === 'pending'
                          ? 'bg-yellow-900/30 text-yellow-300'
                          : 'bg-red-900/30 text-red-300'
                      }`}>
                        {payment.status === 'paid' ? 'Pago' : payment.status === 'pending' ? 'Pendente' : 'Falhou'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Cancelar Assinatura</h3>
            
            <div className="mb-4">
              <p className="text-gray-300 mb-3">
                Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso até o final do período pago.
              </p>
              
              <label className="block text-gray-300 mb-2">Motivo do cancelamento</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Por favor, nos conte o motivo do cancelamento..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Manter Assinatura
              </button>
              <button
                onClick={handleCancelSubscription}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
