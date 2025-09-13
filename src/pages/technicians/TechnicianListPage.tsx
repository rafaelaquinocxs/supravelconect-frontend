import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, MapPin, Clock, DollarSign, Users, Award, CheckCircle } from 'lucide-react';
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
    certifications: string[];
  };
}

interface Specialty {
  id: string;
  name: string;
  description: string;
}

const TechnicianListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    fetchServiceProviders();
    fetchSpecialties();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [serviceProviders, searchTerm, selectedCategory, sortBy, showOnlineOnly]);

  const fetchServiceProviders = async () => {
    try {
      console.log('🔍 Buscando prestadores de serviços...');
      
      const response = await api.get('/api/service-providers');
      console.log('✅ Resposta completa da API:', response);
      console.log('✅ response.data:', response.data);
      console.log('✅ response.data.data:', response.data.data);
      console.log('✅ É array?', Array.isArray(response.data.data));
      
      if (response.data.success && Array.isArray(response.data.data)) {
        console.log('✅ Definindo serviceProviders:', response.data.data);
        setServiceProviders(response.data.data);
      } else if (response.data.data && Array.isArray(response.data.data.providers)) {
        console.log('✅ Usando response.data.data.providers:', response.data.data.providers);
        setServiceProviders(response.data.data.providers);
      } else if (Array.isArray(response.data.providers)) {
        console.log('✅ Usando response.data.providers:', response.data.providers);
        setServiceProviders(response.data.providers);
      } else {
        console.log('⚠️ Estrutura de dados não reconhecida, definindo array vazio');
        setServiceProviders([]);
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar prestadores:', error);
      setServiceProviders([]);
      toast.error('Erro ao carregar especialistas');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await api.get('/api/service-providers/specialties');
      if (response.data.success) {
        setSpecialties(response.data.data);
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar especialidades:', error);
    }
  };

  const filterProviders = () => {
    console.log('🔄 Filtrando providers. serviceProviders:', serviceProviders);
    console.log('🔄 serviceProviders.length:', serviceProviders?.length);
    
    // ✅ CORREÇÃO: Verificar se serviceProviders é um array antes de usar
    if (!Array.isArray(serviceProviders)) {
      console.warn('⚠️ serviceProviders não é um array:', serviceProviders);
      setFilteredProviders([]);
      return;
    }

    let filtered = [...serviceProviders];
    console.log('🔄 Filtered inicial:', filtered);

    // Filtro por categoria/especialidade
    if (selectedCategory !== 'all') {
      const selectedSpec = specialties.find(spec => spec.id === selectedCategory);
      if (selectedSpec) {
        filtered = filtered.filter(provider => {
          const specialties = provider.serviceProvider?.specialties || [];
          const subSpecialties = provider.serviceProvider?.subSpecialties || [];
          
          return specialties.some(spec => 
            spec && spec.toLowerCase().includes(selectedSpec.name.toLowerCase())
          ) || subSpecialties.some(spec => 
            spec && spec.toLowerCase().includes(selectedSpec.name.toLowerCase())
          );
        });
      }
    }

    // Filtro por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(provider => {
        const name = provider.name || '';
        const description = provider.serviceProvider?.description || '';
        const specialties = provider.serviceProvider?.specialties || [];
        const subSpecialties = provider.serviceProvider?.subSpecialties || [];
        
        return name.toLowerCase().includes(term) ||
               description.toLowerCase().includes(term) ||
               specialties.some(spec => spec?.toLowerCase().includes(term)) ||
               subSpecialties.some(spec => spec?.toLowerCase().includes(term));
      });
    }

    // Filtro por disponibilidade online
    if (showOnlineOnly) {
      filtered = filtered.filter(provider => 
        provider.serviceProvider?.isAvailable === true
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price':
          return (a.serviceProvider?.hourlyRate || 0) - (b.serviceProvider?.hourlyRate || 0);
        case 'experience':
          return (b.serviceProvider?.experience || 0) - (a.serviceProvider?.experience || 0);
        default:
          return 0;
      }
    });

    console.log('✅ Filtered final:', filtered);
    console.log('✅ Definindo filteredProviders com', filtered.length, 'items');
    setFilteredProviders(filtered);
  };

  // ✅ CORREÇÃO: Navegar para ScheduleSessionPage em vez de fazer POST direto
  const handleScheduleSession = (providerId: string, providerName: string) => {
    console.log('📅 Navegando para agendamento detalhado:', { providerId, providerName });
    
    // Navegar para página de agendamento detalhado
    navigate(`/app/sessions/schedule/${providerId}`, {
      state: { 
        providerName,
        providerId 
      }
    });
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Especialistas em Manutenção
        </h1>
        <p className="text-gray-400">
          Encontre o especialista ideal para resolver problemas em sua manutenção
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, especialidade ou problema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Categoria */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">Todas as especialidades</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="rating">Melhor avaliação</option>
            <option value="price">Menor preço</option>
            <option value="experience">Mais experiência</option>
          </select>

          {/* Filtro Online */}
          <label className="flex items-center space-x-2 text-white">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500"
            />
            <span>Apenas online</span>
          </label>
        </div>
      </div>

      {/* Lista de Prestadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors"
          >
            {/* Header do Card */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {provider.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{provider.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium">{provider.rating.toFixed(1)}</span>
                    <span className="text-gray-400">
                      ({provider.serviceProvider?.completedJobs || 0})
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-primary-400 font-medium">
                      R$ {provider.serviceProvider?.hourlyRate || 150} /hora
                    </span>
                  </div>
                </div>
              </div>
              
              {provider.serviceProvider?.isAvailable && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-sm font-medium">On-line</span>
                  <span className="text-gray-400 text-sm">
                    • {provider.serviceProvider?.responseTime || '24h'}
                  </span>
                </div>
              )}
            </div>

            {/* Descrição */}
            <p className="text-gray-300 mb-4">
              {provider.serviceProvider?.description || 'Descrição não informada'}
            </p>

            {/* Especialidades */}
            <div className="mb-4">
              <h4 className="text-white font-medium mb-2">Especialidades:</h4>
              <div className="flex flex-wrap gap-2">
                {(provider.serviceProvider?.specialties || []).slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
                {(provider.serviceProvider?.specialties || []).length > 3 && (
                  <span className="text-gray-400 text-sm">
                    + {(provider.serviceProvider?.specialties || []).length - 3} mais
                  </span>
                )}
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center space-x-2 text-gray-400">
                <Award className="w-4 h-4" />
                <span>{provider.serviceProvider?.experience || 0} anos</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>{provider.serviceProvider?.location || 'Caxias do Sul'}</span>
              </div>
            </div>

            {/* Botão de Ação */}
            <button
              onClick={() => handleScheduleSession(provider.id, provider.name)}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg transition-colors font-medium"
            >
              Agendar Sessão
            </button>
          </div>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Estatísticas</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {filteredProviders.length}
            </div>
            <div className="text-gray-400">Especialistas</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {filteredProviders.filter(p => p.serviceProvider?.isAvailable).length}
            </div>
            <div className="text-gray-400">Agora online</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {specialties.length}
            </div>
            <div className="text-gray-400">Especialidades</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {filteredProviders.reduce((total, p) => total + (p.serviceProvider?.completedJobs || 0), 0)}
            </div>
            <div className="text-gray-400">Sessões realizadas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianListPage;
