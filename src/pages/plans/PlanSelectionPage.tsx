import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  features: string[];
  isPopular?: boolean;
  billingCycle: 'monthly' | 'yearly';
}

interface LocationState {
  userType: 'client' | 'technician';
  userData: any;
}

const PlanSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const state = location.state as LocationState;
  const userType = state?.userType || 'client';
  const userData = state?.userData;

  useEffect(() => {
    if (!userData) {
      navigate('/auth/register');
      return;
    }
    
    fetchPlans();
  }, [userData, navigate]);

  const fetchPlans = async () => {
    try {
      // Simular dados dos planos (substituir por API real)
      const mockPlans: Plan[] = [
        {
          id: 'basic',
          name: 'Básico',
          description: 'Ideal para uso ocasional',
          price: 29.90,
          credits: 50,
          billingCycle: 'monthly',
          features: [
            '50 créditos mensais',
            'Suporte por chat',
            'Acesso a técnicos básicos',
            'Histórico de 30 dias'
          ]
        },
        {
          id: 'premium',
          name: 'Premium',
          description: 'Melhor custo-benefício',
          price: 59.90,
          credits: 120,
          billingCycle: 'monthly',
          isPopular: true,
          features: [
            '120 créditos mensais',
            'Suporte prioritário',
            'Acesso a todos os técnicos',
            'Histórico completo',
            'Agendamento avançado',
            'Relatórios detalhados'
          ]
        },
        {
          id: 'enterprise',
          name: 'Empresarial',
          description: 'Para empresas e uso intensivo',
          price: 149.90,
          credits: 350,
          billingCycle: 'monthly',
          features: [
            '350 créditos mensais',
            'Suporte 24/7',
            'Técnicos especializados',
            'API personalizada',
            'Múltiplos usuários',
            'Dashboard empresarial',
            'Integração com sistemas'
          ]
        }
      ];

      // Para técnicos, mostrar planos específicos
      if (userType === 'technician') {
        const technicianPlans: Plan[] = [
          {
            id: 'tech-basic',
            name: 'Técnico Básico',
            description: 'Comece sua jornada como técnico',
            price: 19.90,
            credits: 0,
            billingCycle: 'monthly',
            features: [
              'Perfil básico',
              'Até 20 atendimentos/mês',
              'Comissão de 70%',
              'Suporte por email'
            ]
          },
          {
            id: 'tech-pro',
            name: 'Técnico Profissional',
            description: 'Para técnicos experientes',
            price: 39.90,
            credits: 0,
            billingCycle: 'monthly',
            isPopular: true,
            features: [
              'Perfil destacado',
              'Atendimentos ilimitados',
              'Comissão de 80%',
              'Suporte prioritário',
              'Ferramentas avançadas',
              'Relatórios financeiros'
            ]
          },
          {
            id: 'tech-expert',
            name: 'Técnico Expert',
            description: 'Para especialistas reconhecidos',
            price: 79.90,
            credits: 0,
            billingCycle: 'monthly',
            features: [
              'Perfil premium',
              'Prioridade máxima',
              'Comissão de 85%',
              'Suporte dedicado',
              'Marketing personalizado',
              'Certificações',
              'Programa de mentoria'
            ]
          }
        ];
        setPlans(technicianPlans);
      } else {
        setPlans(mockPlans);
      }
      
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = async () => {
    if (!selectedPlan) return;
    
    setProcessing(true);
    
    try {
      // Primeiro, registrar o usuário
      const userDataWithPlan = {
        ...userData,
        planId: selectedPlan
      };
      
      await register(userDataWithPlan);
      
      // Redirecionar para pagamento
      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      navigate('/payment', {
        state: {
          plan: selectedPlanData,
          userType,
          userData: userDataWithPlan
        }
      });
      
    } catch (error) {
      console.error('Erro ao processar:', error);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-400 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-400">
      <div className="container-custom py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Escolha seu Plano
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {userType === 'technician' 
              ? 'Selecione o plano que melhor se adequa ao seu perfil profissional'
              : 'Selecione o plano ideal para suas necessidades de suporte técnico'
            }
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-gray-800 border-2 rounded-lg p-8 cursor-pointer transition-all duration-300 ${
                selectedPlan === plan.id
                  ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                  : 'border-gray-700 hover:border-gray-600'
              } ${plan.isPopular ? 'ring-2 ring-primary-500/50' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="text-4xl font-bold text-primary-500 mb-2">
                  R$ {plan.price.toFixed(2)}
                </div>
                <p className="text-gray-400 text-sm">por mês</p>
                {userType === 'client' && (
                  <p className="text-primary-400 font-medium mt-2">
                    {plan.credits} créditos inclusos
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Select Button */}
              <button
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedPlan === plan.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {selectedPlan === plan.id ? 'Selecionado' : 'Selecionar Plano'}
              </button>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center mt-12">
          <button
            onClick={handleContinue}
            disabled={!selectedPlan || processing}
            className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </>
            ) : (
              'Continuar para Pagamento'
            )}
          </button>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/auth/register')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Voltar ao cadastro
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionPage;

