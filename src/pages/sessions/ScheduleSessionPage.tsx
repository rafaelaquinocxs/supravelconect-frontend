import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Interfaces
interface Technician {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  hourlyRate: number;
  responseTime: string;
  bio: string;
  profileImage?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface ScheduleData {
  technicianId: string;
  date: string;
  time: string;
  duration: number;
  issue: string;
  specialty: string;
  urgency: 'low' | 'medium' | 'high';
  description: string;
  estimatedCost: number;
}

const ScheduleSessionPage: React.FC = () => {
  const { technicianId } = useParams<{ technicianId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [scheduleData, setScheduleData] = useState<ScheduleData>({
    technicianId: technicianId || '',
    date: '',
    time: '',
    duration: 60,
    issue: '',
    specialty: '',
    urgency: 'medium',
    description: '',
    estimatedCost: 0
  });

  const specialtyOptions = [
    'Elétrica',
    'Hidráulica',
    'Motor',
    'Transmissão',
    'Sistemas Eletrônicos',
    'Manutenção Preventiva'
  ];

  const durationOptions = [
    { value: 30, label: '30 minutos', multiplier: 0.5 },
    { value: 60, label: '1 hora', multiplier: 1 },
    { value: 90, label: '1h 30min', multiplier: 1.5 },
    { value: 120, label: '2 horas', multiplier: 2 },
    { value: 180, label: '3 horas', multiplier: 3 }
  ];

  useEffect(() => {
    if (technicianId) {
      fetchTechnicianData();
    }
  }, [technicianId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, technicianId]);

  useEffect(() => {
    calculateEstimatedCost();
  }, [scheduleData.duration, technician]);

  const fetchTechnicianData = async () => {
    try {
      // Simular dados do técnico (substituir por API real)
      const mockTechnician: Technician = {
        id: technicianId || '',
        name: 'João Silva',
        specialties: ['Elétrica', 'Sistemas Eletrônicos'],
        rating: 4.9,
        hourlyRate: 85,
        responseTime: '< 5 min',
        bio: 'Especialista em sistemas elétricos com mais de 10 anos de experiência em empilhadeiras e equipamentos industriais.'
      };
      
      setTechnician(mockTechnician);
      setScheduleData(prev => ({
        ...prev,
        specialty: mockTechnician.specialties[0]
      }));
      
    } catch (error) {
      console.error('Erro ao carregar dados do técnico:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      // Simular horários disponíveis (substituir por API real)
      const mockSlots: TimeSlot[] = [
        { time: '08:00', available: true },
        { time: '08:30', available: true },
        { time: '09:00', available: false },
        { time: '09:30', available: true },
        { time: '10:00', available: true },
        { time: '10:30', available: false },
        { time: '11:00', available: true },
        { time: '11:30', available: true },
        { time: '13:00', available: true },
        { time: '13:30', available: false },
        { time: '14:00', available: true },
        { time: '14:30', available: true },
        { time: '15:00', available: true },
        { time: '15:30', available: false },
        { time: '16:00', available: true },
        { time: '16:30', available: true },
        { time: '17:00', available: true },
        { time: '17:30', available: false }
      ];
      
      setAvailableSlots(mockSlots);
      
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    }
  };

  const calculateEstimatedCost = () => {
    if (!technician) return;
    
    const duration = scheduleData.duration;
    const hourlyRate = technician.hourlyRate;
    const hours = duration / 60;
    const cost = hours * hourlyRate;
    
    setScheduleData(prev => ({
      ...prev,
      estimatedCost: cost
    }));
  };

  const handleInputChange = (field: keyof ScheduleData, value: any) => {
    setScheduleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setScheduleData(prev => ({
      ...prev,
      date,
      time: ''
    }));
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setScheduleData(prev => ({
      ...prev,
      time
    }));
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 dias no futuro
    return maxDate.toISOString().split('T')[0];
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduleData.date || !scheduleData.time || !scheduleData.issue || !scheduleData.description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await api.post('/api/sessions/schedule', {
        ...scheduleData,
        clientId: user?.id
      });
      
      if (response.data.success) {
        alert('Sessão agendada com sucesso! O técnico será notificado.');
        navigate('/app/sessions');
      } else {
        throw new Error(response.data.message || 'Erro ao agendar sessão');
      }
      
    } catch (error: any) {
      console.error('Erro ao agendar sessão:', error);
      alert(error.response?.data?.message || 'Erro ao agendar sessão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="container-custom py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Técnico não encontrado</h2>
          <button onClick={() => navigate('/app/technicians')} className="btn btn-primary">
            Voltar à busca
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/app/technicians')}
          className="text-gray-400 hover:text-white mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar à busca
        </button>
        
        <h1 className="text-3xl font-bold mb-2 text-white">
          Agendar Sessão
        </h1>
        <p className="text-gray-300">
          Agende uma sessão de suporte técnico com {technician.name}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Problem Description */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Descrição do Problema</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Especialidade Necessária *
                  </label>
                  <select
                    value={scheduleData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                    required
                  >
                    {specialtyOptions.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Resumo do Problema *
                  </label>
                  <input
                    type="text"
                    value={scheduleData.issue}
                    onChange={(e) => handleInputChange('issue', e.target.value)}
                    placeholder="Ex: Empilhadeira não liga após manutenção"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descrição Detalhada *
                  </label>
                  <textarea
                    value={scheduleData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Descreva o problema em detalhes, incluindo quando começou, sintomas observados, tentativas de solução, etc."
                    rows={4}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Urgência
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'low', label: 'Baixa', desc: 'Pode aguardar' },
                      { value: 'medium', label: 'Média', desc: 'Alguns dias' },
                      { value: 'high', label: 'Alta', desc: 'Urgente' }
                    ].map((urgency) => (
                      <div
                        key={urgency.value}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                          scheduleData.urgency === urgency.value
                            ? getUrgencyColor(urgency.value)
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => handleInputChange('urgency', urgency.value)}
                      >
                        <div className="text-center">
                          <h4 className="font-medium text-white">{urgency.label}</h4>
                          <p className="text-xs text-gray-400">{urgency.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Data e Horário</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      min={getMinDate()}
                      max={getMaxDate()}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duração Estimada
                    </label>
                    <select
                      value={scheduleData.duration}
                      onChange={(e) => handleInputChange('duration', Number(e.target.value))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                    >
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Horário Disponível *
                    </label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => slot.available && handleTimeSelect(slot.time)}
                          disabled={!slot.available}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            selectedTime === slot.time
                              ? 'bg-primary-500 text-white'
                              : slot.available
                              ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                              : 'bg-gray-900 text-gray-500 cursor-not-allowed border border-gray-800'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                    {selectedDate && availableSlots.filter(s => s.available).length === 0 && (
                      <p className="text-yellow-400 text-sm mt-2">
                        Nenhum horário disponível para esta data. Tente outra data.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !selectedDate || !selectedTime || !scheduleData.issue || !scheduleData.description}
                className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Agendando...
                  </>
                ) : (
                  'Agendar Sessão'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Technician Info */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Técnico Selecionado</h3>
            
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-medium">
                  {technician.name.charAt(0)}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-white">{technician.name}</h4>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white text-sm">{technician.rating}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Especialidades:</span>
                <span className="text-white">{technician.specialties.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tempo de resposta:</span>
                <span className="text-white">{technician.responseTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Valor por hora:</span>
                <span className="text-white">R$ {technician.hourlyRate}</span>
              </div>
            </div>
          </div>

          {/* Cost Estimate */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Estimativa de Custo</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duração:</span>
                <span className="text-white">
                  {durationOptions.find(d => d.value === scheduleData.duration)?.label}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Valor por hora:</span>
                <span className="text-white">R$ {technician.hourlyRate}</span>
              </div>
              
              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between">
                  <span className="font-medium text-white">Total estimado:</span>
                  <span className="font-bold text-primary-400 text-lg">
                    R$ {scheduleData.estimatedCost.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 mt-2">
                * Valor final pode variar conforme a duração real da sessão
              </p>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Como Funciona</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Agendamento</p>
                  <p className="text-gray-400">O técnico será notificado e confirmará a sessão</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">Conexão</p>
                  <p className="text-gray-400">No horário marcado, vocês se conectarão via videochamada</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">Suporte</p>
                  <p className="text-gray-400">Receba orientações em tempo real para resolver o problema</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div>
                  <p className="text-white font-medium">Pagamento</p>
                  <p className="text-gray-400">Pague apenas pelo tempo utilizado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSessionPage;

