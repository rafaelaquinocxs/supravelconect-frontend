import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  responseTime: string;
  totalSessions: number;
  isOnline: boolean;
  hourlyRate: number;
  avatar?: string;
}

interface AppointmentData {
  helperId: string;
  type: 'consultation' | 'support' | 'training' | 'maintenance';
  scheduledTime: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedDuration: number;
}

const SchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    helperId: '',
    type: 'consultation',
    scheduledTime: '',
    description: '',
    urgency: 'medium',
    estimatedDuration: 30
  });

  // Filtros
  const [filters, setFilters] = useState({
    specialty: '',
    minRating: 0,
    onlineOnly: false
  });

  const specialties = [
    'Elétrica',
    'Hidráulica', 
    'Motor',
    'Transmissão',
    'Sistemas Eletrônicos',
    'Manutenção Preventiva'
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'Consulta Técnica', description: 'Orientação e diagnóstico' },
    { value: 'support', label: 'Suporte Remoto', description: 'Resolução de problemas em tempo real' },
    { value: 'training', label: 'Treinamento', description: 'Capacitação e ensino' },
    { value: 'maintenance', label: 'Manutenção Guiada', description: 'Orientação para manutenção' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Baixa', color: 'text-green-400' },
    { value: 'medium', label: 'Média', color: 'text-yellow-400' },
    { value: 'high', label: 'Alta', color: 'text-red-400' }
  ];

  useEffect(() => {
    fetchSpecialists();
  }, [filters]);

  const fetchSpecialists = async () => {
    try {
      const response = await api.get('/api/users/available', {
        params: filters
      });
      setSpecialists(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar especialistas:', error);
      // Dados mockados para demonstração
      setSpecialists([
        {
          id: '1',
          name: 'João Silva',
          specialty: 'Elétrica',
          rating: 4.9,
          responseTime: '< 5 min',
          totalSessions: 234,
          isOnline: true,
          hourlyRate: 85
        },
        {
          id: '2',
          name: 'Maria Santos',
          specialty: 'Hidráulica',
          rating: 4.8,
          responseTime: '< 3 min',
          totalSessions: 189,
          isOnline: true,
          hourlyRate: 90
        },
        {
          id: '3',
          name: 'Carlos Oliveira',
          specialty: 'Motor',
          rating: 4.7,
          responseTime: '< 10 min',
          totalSessions: 156,
          isOnline: false,
          hourlyRate: 80
        },
        {
          id: '4',
          name: 'Ana Costa',
          specialty: 'Sistemas Eletrônicos',
          rating: 4.9,
          responseTime: '< 2 min',
          totalSessions: 298,
          isOnline: true,
          hourlyRate: 95
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpecialist = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setAppointmentData({ ...appointmentData, helperId: specialist.id });
    setShowForm(true);
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appointmentData.helperId || !appointmentData.scheduledTime || !appointmentData.description) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Verificar se o horário é no futuro
    const scheduledDate = new Date(appointmentData.scheduledTime);
    if (scheduledDate <= new Date()) {
      toast.error('O horário deve ser no futuro');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/api/appointments', appointmentData);
      
      toast.success('Agendamento criado com sucesso!');
      
      // Reset form
      setAppointmentData({
        helperId: '',
        type: 'consultation',
        scheduledTime: '',
        description: '',
        urgency: 'medium',
        estimatedDuration: 30
      });
      setSelectedSpecialist(null);
      setShowForm(false);
      
    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar agendamento');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSpecialists = specialists.filter(specialist => {
    if (filters.specialty && specialist.specialty !== filters.specialty) return false;
    if (filters.minRating && specialist.rating < filters.minRating) return false;
    if (filters.onlineOnly && !specialist.isOnline) return false;
    return true;
  });

  const calculateEstimatedCost = () => {
    if (!selectedSpecialist) return 0;
    return Math.ceil((appointmentData.estimatedDuration / 60) * selectedSpecialist.hourlyRate);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Agendar Sessão</h1>
        <p className="text-gray-400">
          Escolha um especialista e agende uma sessão para resolver seu problema
        </p>
      </div>

      {!showForm ? (
        <>
          {/* Filtros */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Especialidade</label>
                <select
                  value={filters.specialty}
                  onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todas</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm mb-2">Avaliação Mínima</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={0}>Qualquer</option>
                  <option value={4}>4+ estrelas</option>
                  <option value={4.5}>4.5+ estrelas</option>
                  <option value={4.8}>4.8+ estrelas</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={filters.onlineOnly}
                    onChange={(e) => setFilters({ ...filters, onlineOnly: e.target.checked })}
                    className="mr-2 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500"
                  />
                  Apenas online
                </label>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ specialty: '', minRating: 0, onlineOnly: false })}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Especialistas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpecialists.map((specialist) => (
              <div key={specialist.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-primary-500/50 transition-colors">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {specialist.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{specialist.name}</h3>
                    <p className="text-gray-400 flex items-center">
                      {specialist.isOnline && (
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      )}
                      {specialist.specialty}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avaliação</span>
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-white">{specialist.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tempo de resposta</span>
                    <span className="text-white">{specialist.responseTime}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sessões realizadas</span>
                    <span className="text-white">{specialist.totalSessions}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valor/hora</span>
                    <span className="text-white">R$ {specialist.hourlyRate}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectSpecialist(specialist)}
                  disabled={!specialist.isOnline}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    specialist.isOnline
                      ? 'bg-primary-500 hover:bg-primary-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {specialist.isOnline ? 'Agendar Sessão' : 'Offline'}
                </button>
              </div>
            ))}
          </div>

          {filteredSpecialists.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                Nenhum especialista encontrado com os filtros aplicados
              </div>
              <button
                onClick={() => setFilters({ specialty: '', minRating: 0, onlineOnly: false })}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </>
      ) : (
        /* Formulário de Agendamento */
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Agendar com {selectedSpecialist?.name}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitAppointment} className="space-y-6">
              {/* Tipo de Sessão */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">Tipo de Sessão</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {appointmentTypes.map((type) => (
                    <label
                      key={type.value}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                        appointmentData.type === type.value
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={appointmentData.type === type.value}
                        onChange={(e) => setAppointmentData({ ...appointmentData, type: e.target.value as any })}
                        className="sr-only"
                      />
                      <div className="text-white font-medium">{type.label}</div>
                      <div className="text-gray-400 text-sm">{type.description}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Data e Hora */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={appointmentData.scheduledTime}
                  onChange={(e) => setAppointmentData({ ...appointmentData, scheduledTime: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Duração Estimada */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Duração Estimada (minutos)</label>
                <select
                  value={appointmentData.estimatedDuration}
                  onChange={(e) => setAppointmentData({ ...appointmentData, estimatedDuration: Number(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1h 30min</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>

              {/* Urgência */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">Nível de Urgência</label>
                <div className="flex space-x-4">
                  {urgencyLevels.map((level) => (
                    <label
                      key={level.value}
                      className={`flex items-center space-x-2 cursor-pointer ${
                        appointmentData.urgency === level.value ? level.color : 'text-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        value={level.value}
                        checked={appointmentData.urgency === level.value}
                        onChange={(e) => setAppointmentData({ ...appointmentData, urgency: e.target.value as any })}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        appointmentData.urgency === level.value ? 'border-current bg-current' : 'border-gray-600'
                      }`}></div>
                      <span>{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Descrição do Problema</label>
                <textarea
                  value={appointmentData.description}
                  onChange={(e) => setAppointmentData({ ...appointmentData, description: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Descreva detalhadamente o problema que precisa ser resolvido..."
                  required
                />
              </div>

              {/* Resumo do Custo */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Resumo do Agendamento</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Especialista:</span>
                    <span className="text-white">{selectedSpecialist?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duração:</span>
                    <span className="text-white">{appointmentData.estimatedDuration} minutos</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Valor estimado:</span>
                    <span className="text-white">R$ {calculateEstimatedCost()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Créditos necessários:</span>
                    <span className="text-white">{Math.ceil(calculateEstimatedCost() / 10)}</span>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
