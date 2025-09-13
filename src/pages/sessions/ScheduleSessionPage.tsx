import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  User, 
  FileText, 
  Settings,
  CheckCircle,
  Star
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  rating: number;
  serviceProvider?: {
    specialties: string[];
    subSpecialties: string[];
    hourlyRate: number;
    experience: number;
    description: string;
    isAvailable: boolean;
    location: string;
    responseTime: string;
    completedJobs: number;
  };
}

const ScheduleSessionPage: React.FC = () => {
  const { technicianId } = useParams<{ technicianId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Estados do formulário
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    specialty: '',
    urgency: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: 60,
    issue: '',
    location: '',
    contactPreference: 'video' as 'video' | 'phone' | 'chat',
    additionalNotes: '',
    budget: 0
  });

  // Carregar dados do técnico
  useEffect(() => {
    const fetchProvider = async () => {
      try {
        console.log('🔍 Carregando dados do técnico:', technicianId);
        
        const response = await api.get(`/api/service-providers/${technicianId}`);
        
        if (response.data.success) {
          const providerData = response.data.data;
          setProvider(providerData);
          
          // Pré-preencher alguns campos
          setFormData(prev => ({
            ...prev,
            specialty: providerData.serviceProvider?.specialties?.[0] || '',
            budget: providerData.serviceProvider?.hourlyRate || 150
          }));
        }
      } catch (error: any) {
        console.error('❌ Erro ao carregar técnico:', error);
        toast.error('Erro ao carregar dados do especialista');
        navigate('/app/specialists');
      } finally {
        setLoading(false);
      }
    };

    if (technicianId) {
      fetchProvider();
    }
  }, [technicianId, navigate]);

  // Atualizar campos do formulário
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calcular custo estimado
  const calculateEstimatedCost = () => {
    const hourlyRate = provider?.serviceProvider?.hourlyRate || 150;
    const hours = formData.estimatedDuration / 60;
    return hourlyRate * hours;
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!provider || !user) return;

    // Validações
    if (!formData.title.trim()) {
      toast.error('Por favor, informe um título para a sessão');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Por favor, descreva o problema');
      return;
    }

    if (!formData.issue.trim()) {
      toast.error('Por favor, detalhe o problema técnico');
      return;
    }

    if (!formData.scheduledDate) {
      toast.error('Por favor, selecione uma data');
      return;
    }

    if (!formData.scheduledTime) {
      toast.error('Por favor, selecione um horário');
      return;
    }

    setSubmitting(true);

    try {
      console.log('📅 Criando agendamento:', formData);

      const sessionData = {
        technicianId: provider.id,
        title: formData.title,
        description: formData.description,
        specialty: formData.specialty,
        urgency: formData.urgency,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        estimatedDuration: formData.estimatedDuration,
        issue: formData.issue,
        hourlyRate: provider.serviceProvider?.hourlyRate || 150,
        estimatedCost: calculateEstimatedCost(),
        location: formData.location,
        contactPreference: formData.contactPreference,
        additionalNotes: formData.additionalNotes
      };

      const response = await api.post('/api/sessions/schedule', sessionData);

      if (response.data.success) {
        toast.success('Sessão agendada com sucesso!');
        navigate('/app/dashboard');
      }
    } catch (error: any) {
      console.error('❌ Erro ao agendar sessão:', error);
      toast.error(error.response?.data?.message || 'Erro ao agendar sessão');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Especialista não encontrado</h2>
          <p className="text-gray-400 mb-6">O especialista que você está procurando não existe.</p>
          <button
            onClick={() => navigate('/app/specialists')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
          >
            Voltar para Especialistas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/app/specialists')}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Agendar Sessão</h1>
          <p className="text-gray-400">Forneça detalhes sobre o problema para o especialista</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário Principal */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Informações da Sessão
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Título da Sessão *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Manutenção preventiva do ar condicionado"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Descrição Geral *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva brevemente o que precisa ser feito..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Especialidade
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) => handleInputChange('specialty', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    >
                      {provider.serviceProvider?.specialties?.map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Urgência
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    >
                      <option value="LOW">Baixa - Pode aguardar alguns dias</option>
                      <option value="MEDIUM">Média - Precisa ser resolvido em breve</option>
                      <option value="HIGH">Alta - Urgente, precisa ser resolvido hoje</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes Técnicos */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Detalhes do Problema
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Descrição Detalhada do Problema *
                  </label>
                  <textarea
                    value={formData.issue}
                    onChange={(e) => handleInputChange('issue', e.target.value)}
                    placeholder="Descreva em detalhes o problema técnico, sintomas observados, quando começou, etc..."
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Local/Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Endereço onde será realizada a manutenção"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Observações Adicionais
                  </label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    placeholder="Informações extras que podem ajudar o especialista..."
                    rows={3}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Agendamento */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Data e Horário
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Horário *
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Duração Estimada (min)
                  </label>
                  <select
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1h 30min</option>
                    <option value={120}>2 horas</option>
                    <option value={180}>3 horas</option>
                    <option value={240}>4 horas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/app/specialists')}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white py-3 rounded-lg transition-colors flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Agendando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Agendar Sessão
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar - Informações do Especialista */}
        <div className="space-y-6">
          {/* Dados do Especialista */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Especialista</h2>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {provider.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">{provider.rating.toFixed(1)}</span>
                  <span className="text-gray-400">
                    ({provider.serviceProvider?.completedJobs || 0} trabalhos)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Experiência:</span>
                <span className="text-white">{provider.serviceProvider?.experience || 0} anos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Valor/hora:</span>
                <span className="text-white">R$ {provider.serviceProvider?.hourlyRate || 150}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tempo resposta:</span>
                <span className="text-white">{provider.serviceProvider?.responseTime || '24h'}</span>
              </div>
            </div>
          </div>

          {/* Resumo do Orçamento */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Estimativa de Custo
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valor/hora:</span>
                <span className="text-white">R$ {provider.serviceProvider?.hourlyRate || 150}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duração:</span>
                <span className="text-white">{formData.estimatedDuration} min</span>
              </div>
              <hr className="border-gray-600" />
              <div className="flex justify-between font-semibold">
                <span className="text-white">Total estimado:</span>
                <span className="text-primary-400">R$ {calculateEstimatedCost().toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-800 rounded-lg">
              <p className="text-yellow-300 text-xs">
                * Valor estimado. O custo final pode variar conforme a complexidade do trabalho.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSessionPage;
