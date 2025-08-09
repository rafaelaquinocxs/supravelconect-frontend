import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface Technician {
  id: string;
  name: string;
  avatar?: string;
  specialty: string;
  subSpecialties: string[];
  rating: number;
  totalSessions: number;
  isOnline: boolean;
  hourlyRate: number;
  responseTime: string;
  description: string;
  experience: number;
  certifications: string[];
  location: string;
}

const FORKLIFT_CATEGORIES = [
  { id: 'all', name: 'Todas as Categorias', icon: '🏭' },
  { id: 'eletrica', name: 'Empilhadeira Elétrica', icon: '⚡' },
  { id: 'combustao', name: 'Combustão (GLP/Diesel)', icon: '⛽' },
  { id: 'reach', name: 'Reach Truck', icon: '📏' },
  { id: 'paleteira', name: 'Paleteira Elétrica', icon: '📦' },
  { id: 'order-picker', name: 'Order Picker', icon: '📋' },
  { id: 'lateral', name: 'Empilhadeira Lateral', icon: '↔️' },
  { id: 'trilateral', name: 'Trilateral', icon: '🔄' },
  { id: 'contrapeso', name: 'Contrapeso', icon: '⚖️' }
];

const PROBLEM_TYPES = [
  'Motor não liga',
  'Problema hidráulico',
  'Sistema elétrico',
  'Freios',
  'Direção',
  'Mastro/Garfos',
  'Bateria',
  'Carregador',
  'Manutenção preventiva',
  'Outros'
];

const TechniciansPage: React.FC = () => {
  const { user } = useAuth();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'experience'>('rating');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  useEffect(() => {
    filterTechnicians();
  }, [technicians, selectedCategory, searchTerm, sortBy, showOnlineOnly]);

  const fetchTechnicians = async () => {
    try {
      const response = await api.get('/api/technicians');
      setTechnicians(response.data.data);
    } catch (error) {
      console.error('Erro ao buscar técnicos:', error);
      
      // Dados mockados específicos para empilhadeiras
      setTechnicians([
        {
          id: '1',
          name: 'João Silva',
          specialty: 'eletrica',
          subSpecialties: ['Bateria', 'Sistema elétrico', 'Carregador'],
          rating: 4.9,
          totalSessions: 234,
          isOnline: true,
          hourlyRate: 85,
          responseTime: '< 5 min',
          description: 'Especialista em empilhadeiras elétricas com 8 anos de experiência. Foco em sistemas de bateria e eletrônica.',
          experience: 8,
          certifications: ['Toyota', 'Hyster', 'Crown'],
          location: 'São Paulo, SP'
        },
        {
          id: '2',
          name: 'Maria Santos',
          specialty: 'combustao',
          subSpecialties: ['Motor diesel', 'Sistema GLP', 'Transmissão'],
          rating: 4.8,
          totalSessions: 189,
          isOnline: true,
          hourlyRate: 90,
          responseTime: '< 10 min',
          description: 'Técnica especializada em empilhadeiras a combustão. Experiência com motores diesel e GLP.',
          experience: 12,
          certifications: ['Caterpillar', 'Komatsu', 'Mitsubishi'],
          location: 'Rio de Janeiro, RJ'
        },
        {
          id: '3',
          name: 'Carlos Oliveira',
          specialty: 'reach',
          subSpecialties: ['Mastro telescópico', 'Sistema hidráulico', 'Direção'],
          rating: 4.7,
          totalSessions: 156,
          isOnline: false,
          hourlyRate: 95,
          responseTime: '< 15 min',
          description: 'Especialista em Reach Trucks e equipamentos de armazém. Foco em sistemas hidráulicos complexos.',
          experience: 10,
          certifications: ['Raymond', 'Crown', 'Yale'],
          location: 'Belo Horizonte, MG'
        },
        {
          id: '4',
          name: 'Ana Costa',
          specialty: 'paleteira',
          subSpecialties: ['Motor elétrico', 'Sistema de elevação', 'Controles'],
          rating: 4.6,
          totalSessions: 98,
          isOnline: true,
          hourlyRate: 75,
          responseTime: '< 8 min',
          description: 'Técnica em paleteiras elétricas e equipamentos de movimentação leve.',
          experience: 6,
          certifications: ['BT', 'Linde', 'Still'],
          location: 'Curitiba, PR'
        },
        {
          id: '5',
          name: 'Roberto Lima',
          specialty: 'order-picker',
          subSpecialties: ['Plataforma elevadora', 'Sistema de segurança', 'Controles'],
          rating: 4.8,
          totalSessions: 142,
          isOnline: true,
          hourlyRate: 100,
          responseTime: '< 12 min',
          description: 'Especialista em Order Pickers e equipamentos de altura. Foco em segurança e sistemas de elevação.',
          experience: 9,
          certifications: ['Crown', 'Raymond', 'Jungheinrich'],
          location: 'Porto Alegre, RS'
        },
        {
          id: '6',
          name: 'Fernanda Rocha',
          specialty: 'lateral',
          subSpecialties: ['Sistema lateral', 'Mastro multidirecional', 'Hidráulica'],
          rating: 4.5,
          totalSessions: 87,
          isOnline: false,
          hourlyRate: 110,
          responseTime: '< 20 min',
          description: 'Técnica especializada em empilhadeiras laterais e multidirecionais para cargas longas.',
          experience: 7,
          certifications: ['Combilift', 'Hubtex', 'Baumann'],
          location: 'Salvador, BA'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterTechnicians = () => {
    let filtered = [...technicians];

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tech => tech.specialty === selectedCategory);
    }

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(tech =>
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.subSpecialties.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtro por online
    if (showOnlineOnly) {
      filtered = filtered.filter(tech => tech.isOnline);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.hourlyRate - b.hourlyRate;
        case 'experience':
          return b.experience - a.experience;
        default:
          return 0;
      }
    });

    setFilteredTechnicians(filtered);
  };

  const handleScheduleSession = (technicianId: string) => {
    // Redirecionar para página de agendamento com técnico pré-selecionado
    window.location.href = `/app/schedule?technician=${technicianId}`;
  };

  const getCategoryName = (categoryId: string) => {
    const category = FORKLIFT_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
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
        <h1 className="text-3xl font-bold text-white mb-2">Especialistas em Empilhadeiras</h1>
        <p className="text-gray-400">
          Encontre o especialista ideal para resolver problemas em sua empilhadeira
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
        {/* Categorias */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-4">Categoria da Empilhadeira</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {FORKLIFT_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-3 rounded-lg border transition-colors text-left ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Buscar por nome, especialidade ou problema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="rating">Melhor avaliação</option>
            <option value="price">Menor preço</option>
            <option value="experience">Mais experiência</option>
          </select>

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

      {/* Lista de Técnicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTechnicians.map((technician) => (
          <div key={technician.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            {/* Header do Card */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {technician.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">{technician.name}</h3>
                  <p className="text-gray-400">{getCategoryName(technician.specialty)}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${technician.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                    <span className={`text-sm ${technician.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                      {technician.isOnline ? 'Online' : 'Offline'}
                    </span>
                    <span className="text-gray-400 text-sm">• {technician.responseTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-white font-medium">{technician.rating}</span>
                  <span className="text-gray-400 text-sm">({technician.totalSessions})</span>
                </div>
                <div className="text-primary-400 font-semibold">
                  R$ {technician.hourlyRate}/hora
                </div>
              </div>
            </div>

            {/* Descrição */}
            <p className="text-gray-300 text-sm mb-4">{technician.description}</p>

            {/* Especialidades */}
            <div className="mb-4">
              <h4 className="text-white font-medium text-sm mb-2">Especialidades:</h4>
              <div className="flex flex-wrap gap-2">
                {technician.subSpecialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            {/* Certificações */}
            <div className="mb-4">
              <h4 className="text-white font-medium text-sm mb-2">Certificações:</h4>
              <div className="flex flex-wrap gap-2">
                {technician.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="bg-primary-900/30 text-primary-300 px-2 py-1 rounded text-xs border border-primary-800"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                <span>{technician.experience} anos • {technician.location}</span>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  to={`/app/specialists/${technician.id}`}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Ver Perfil
                </Link>
                <button
                  onClick={() => handleScheduleSession(technician.id)}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  disabled={!technician.isOnline}
                >
                  {technician.isOnline ? 'Agendar Sessão' : 'Indisponível'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado vazio */}
      {filteredTechnicians.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            Nenhum especialista encontrado
          </div>
          <p className="text-gray-500 mb-6">
            Tente ajustar os filtros ou buscar por outros termos
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
              setShowOnlineOnly(false);
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Estatísticas */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{technicians.length}</div>
            <div className="text-gray-400 text-sm">Especialistas</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {technicians.filter(t => t.isOnline).length}
            </div>
            <div className="text-gray-400 text-sm">Online agora</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {(technicians.reduce((acc, t) => acc + t.rating, 0) / technicians.length).toFixed(1)}
            </div>
            <div className="text-gray-400 text-sm">Avaliação média</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary-400">
              {technicians.reduce((acc, t) => acc + t.totalSessions, 0)}
            </div>
            <div className="text-gray-400 text-sm">Sessões realizadas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechniciansPage;
