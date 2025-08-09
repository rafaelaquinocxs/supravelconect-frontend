import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

// Tipos
interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: {
    id: string;
    name: string;
  }[];
  description: string;
  rating: number;
  totalSessions: number;
  estimatedResponseTime: number;
  isOnline: boolean;
  profileImage?: string;
  availability?: {
    day: string;
    hours: string[];
  }[];
}

interface Review {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const TechnicianDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTechnicianData = async () => {
      try {
        // Buscar dados do técnico
        const technicianResponse = await api.get(`/api/technicians/${id}`);
        setTechnician(technicianResponse.data);

        // Buscar avaliações
        const reviewsResponse = await api.get(`/api/technicians/${id}/reviews`);
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error('Erro ao buscar dados do técnico:', error);
        toast.error('Não foi possível carregar os dados do técnico');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTechnicianData();
    }
  }, [id]);

  // Iniciar chamada imediata
  const handleStartCall = async () => {
    if (!technician) return;

    setBookingLoading(true);
    try {
      const response = await api.post('/api/sessions', {
        technicianId: technician.id,
        type: 'immediate'
      });

      navigate(`/call/${response.data.id}`);
    } catch (error) {
      console.error('Erro ao iniciar chamada:', error);
      toast.error('Não foi possível iniciar a chamada. Verifique seus créditos.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Agendar chamada
  const handleScheduleCall = async () => {
    if (!technician || !selectedDate || !selectedTime) {
      toast.error('Selecione uma data e horário para agendar');
      return;
    }

    setBookingLoading(true);
    try {
      const scheduledAt = `${selectedDate}T${selectedTime}:00`;
      
      const response = await api.post('/api/sessions', {
        technicianId: technician.id,
        type: 'scheduled',
        scheduledAt
      });

      toast.success('Sessão agendada com sucesso!');
      navigate('/app/dashboard');
    } catch (error) {
      console.error('Erro ao agendar sessão:', error);
      toast.error('Não foi possível agendar a sessão. Verifique seus créditos.');
    } finally {
      setBookingLoading(false);
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
        <div className="bg-dark-300 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Técnico não encontrado</h2>
          <p className="text-gray-400 mb-6">
            O técnico que você está procurando não existe ou foi removido.
          </p>
          <Link to="/app/technicians" className="btn btn-primary">
            Voltar para lista de técnicos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6">
        <Link to="/app/technicians" className="text-primary-500 hover:text-primary-400 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para lista de técnicos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna da esquerda - Informações do técnico */}
        <div className="lg:col-span-2">
          <div className="bg-dark-300 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center mb-6">
              <div className="relative mb-4 md:mb-0">
                <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden">
                  {technician.profileImage ? (
                    <img 
                      src={technician.profileImage} 
                      alt={technician.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-900 text-primary-300 text-3xl font-bold">
                      {technician.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-dark-300 ${technician.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              </div>
              
              <div className="md:ml-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <h1 className="text-3xl font-bold mb-2 md:mb-0">{technician.name}</h1>
                  <div className="flex items-center">
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(technician.rating) ? 'text-yellow-500' : 'text-gray-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-300">
                      {technician.rating.toFixed(1)} ({technician.totalSessions} avaliações)
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {technician.specialties.map(specialty => (
                    <span 
                      key={specialty.id}
                      className="bg-dark-200 text-primary-400 px-3 py-1 rounded-full text-sm"
                    >
                      {specialty.name}
                    </span>
                  ))}
                </div>
                
                <div className="mt-3 text-gray-400">
                  <div className="flex items-center mb-1">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Responde em aproximadamente {technician.estimatedResponseTime} minutos</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span>{technician.totalSessions} atendimentos realizados</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-6">
              <h2 className="text-xl font-semibold mb-4">Sobre</h2>
              <p className="text-gray-300 whitespace-pre-line">
                {technician.description || 'Este técnico ainda não adicionou uma descrição.'}
              </p>
            </div>
          </div>
          
          {/* Avaliações */}
          <div className="bg-dark-300 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Avaliações</h2>
            
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-800 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold">{review.clientName}</h3>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500' : 'text-gray-600'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-gray-300">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                Este técnico ainda não possui avaliações.
              </p>
            )}
          </div>
        </div>
        
        {/* Coluna da direita - Agendamento */}
        <div>
          <div className="bg-dark-300 rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Agendar Atendimento</h2>
            
            {technician.isOnline && (
              <div className="mb-6">
                <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-medium">Técnico online agora</span>
                  </div>
                </div>
                
                <button
                  className="btn btn-primary w-full flex justify-center items-center"
                  onClick={handleStartCall}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando...
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Iniciar Chamada Agora
                    </>
                  )}
                </button>
              </div>
            )}
            
            <div className="border-t border-gray-800 pt-6">
              <h3 className="font-semibold mb-4">Ou agende para depois</h3>
              
              <div className="mb-4">
                <label htmlFor="date" className="block text-gray-300 mb-2">
                  Data
                </label>
                <select
                  id="date"
                  className="input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  <option value="">Selecione uma data</option>
                  <option value="2025-07-06">Domingo, 06/07/2025</option>
                  <option value="2025-07-07">Segunda, 07/07/2025</option>
                  <option value="2025-07-08">Terça, 08/07/2025</option>
                  <option value="2025-07-09">Quarta, 09/07/2025</option>
                  <option value="2025-07-10">Quinta, 10/07/2025</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="time" className="block text-gray-300 mb-2">
                  Horário
                </label>
                <select
                  id="time"
                  className="input"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate}
                >
                  <option value="">Selecione um horário</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                </select>
              </div>
              
              <button
                className="btn btn-primary w-full"
                onClick={handleScheduleCall}
                disabled={!selectedDate || !selectedTime || bookingLoading}
              >
                {bookingLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Agendando...
                  </span>
                ) : (
                  'Agendar Sessão'
                )}
              </button>
              
              <div className="mt-4 text-center text-gray-400 text-sm">
                <p>Custo estimado: 30 créditos (30 minutos)</p>
                <p className="mt-1">Você tem: {user?.credits || 0} créditos</p>
                {(user?.credits || 0) < 30 && (
                  <Link to="/app/subscription" className="text-primary-500 hover:text-primary-400 mt-2 inline-block">
                    Comprar mais créditos
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDetailPage;
