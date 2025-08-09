import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Technician {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  totalSessions: number;
  hourlyRate: number;
  isAvailable: boolean;
  profileImage?: string;
  bio: string;
  experience: number;
  responseTime: number; // em minutos
  location: string;
  languages: string[];
  certifications: string[];
}

const TechniciansPage: React.FC = () => {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // rating, price, experience, responseTime

  // Dados mockados de técnicos
  const mockTechnicians: Technician[] = [
    {
      id: '1',
      name: 'João Silva',
      specialties: ['Elétrica', 'Sistemas Eletrônicos'],
      rating: 4.9,
      totalSessions: 234,
      hourlyRate: 85,
      isAvailable: true,
      bio: 'Especialista em sistemas elétricos industriais com mais de 10 anos de experiência. Certificado em automação e controle.',
      experience: 10,
      responseTime: 2,
      location: 'São Paulo, SP',
      languages: ['Português', 'Inglês'],
      certifications: ['NR-10', 'Automação Industrial', 'Siemens']
    },
    {
      id: '2',
      name: 'Maria Santos',
      specialties: ['Hidráulica', 'Manutenção Preventiva'],
      rating: 4.8,
      totalSessions: 189,
      hourlyRate: 75,
      isAvailable: true,
      bio: 'Técnica especializada em sistemas hidráulicos e pneumáticos. Experiência em empilhadeiras Toyota e Hyster.',
      experience: 8,
      responseTime: 3,
      location: 'Rio de Janeiro, RJ',
      languages: ['Português', 'Espanhol'],
      certifications: ['NR-12', 'Hidráulica Industrial', 'Toyota Certified']
    },
    {
      id: '3',
      name: 'Carlos Oliveira',
      specialties: ['Motor', 'Transmissão'],
      rating: 4.7,
      totalSessions: 156,
      hourlyRate: 90,
      isAvailable: false,
      bio: 'Especialista em motores diesel e sistemas de transmissão. Atende equipamentos Caterpillar e Komatsu.',
      experience: 12,
      responseTime: 5,
      location: 'Belo Horizonte, MG',
      languages: ['Português'],
      certifications: ['Caterpillar', 'Motores Diesel', 'NR-13']
    },
    {
      id: '4',
      name: 'Ana Costa',
      specialties: ['Sistemas Eletrônicos', 'Manutenção Preventiva'],
      rating: 4.9,
      totalSessions: 298,
      hourlyRate: 95,
      isAvailable: true,
      bio: 'Engenheira especializada em eletrônica embarcada e sistemas de controle. Experiência internacional.',
      experience: 15,
      responseTime: 1,
      location: 'Curitiba, PR',
      languages: ['Português', 'Inglês', 'Alemão'],
      certifications: ['Bosch', 'Eletrônica Embarcada', 'ISO 9001']
    },
    {
      id: '5',
      name: 'Roberto Lima',
      specialties: ['Elétrica', 'Motor'],
      rating: 4.6,
      totalSessions: 145,
      hourlyRate: 70,
      isAvailable: true,
      bio: 'Técnico com vasta experiência em manutenção de empilhadeiras elétricas e sistemas de carga.',
      experience: 7,
      responseTime: 4,
      location: 'Porto Alegre, RS',
      languages: ['Português'],
      certifications: ['NR-10', 'Sistemas Elétricos']
    },
    {
      id: '6',
      name: 'Fernanda Rocha',
      specialties: ['Hidráulica', 'Transmissão'],
      rating: 4.8,
      totalSessions: 203,
      hourlyRate: 80,
      isAvailable: true,
      bio: 'Especialista em sistemas hidráulicos complexos e transmissões automáticas. Consultora técnica.',
      experience: 9,
      responseTime: 2,
      location: 'Salvador, BA',
      languages: ['Português', 'Inglês'],
      certifications: ['Hidráulica Avançada', 'Transmissões', 'NR-12']
    }
  ];

  const specialties = [
    'Todas',
    'Elétrica',
    'Hidráulica',
    'Motor',
    'Transmissão',
    'Sistemas Eletrônicos',
    'Manutenção Preventiva'
  ];

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setTechnicians(mockTechnicians);
      setFilteredTechnicians(mockTechnicians);
      setLoading(false);
    }, 1000);
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...technicians];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(tech =>
        tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tech.specialties.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        tech.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de especialidade
    if (selectedSpecialty && selectedSpecialty !== 'Todas') {
      filtered = filtered.filter(tech =>
        tech.specialties.includes(selectedSpecialty)
      );
    }

    // Filtro de avaliação
    if (minRating > 0) {
      filtered = filtered.filter(tech => tech.rating >= minRating);
    }

    // Filtro de preço
    filtered = filtered.filter(tech => tech.hourlyRate <= maxPrice);

    // Filtro de disponibilidade
    if (availableOnly) {
      filtered = filtered.filter(tech => tech.isAvailable);
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
        case 'responseTime':
          return a.responseTime - b.responseTime;
        default:
          return 0;
      }
    });

    // Colocar técnicos disponíveis primeiro
    filtered.sort((a, b) => {
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return 0;
    });

    setFilteredTechnicians(filtered);
  }, [technicians, searchTerm, selectedSpecialty, minRating, maxPrice, availableOnly, sortBy]);

  const handleScheduleSession = (technicianId: string) => {
    navigate(`/app/sessions/schedule/${technicianId}`);
  };

  const handleViewProfile = (technicianId: string) => {
    navigate(`/app/technicians/${technicianId}`);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor"/>
                <stop offset="50%" stopColor="transparent"/>
              </linearGradient>
            </defs>
            <path fill="url(#half)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={i} className="w-4 h-4 text-gray-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-400">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-6">
                <div className="h-16 w-16 bg-gray-700 rounded-full mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Encontre um Técnico</h1>
        <p className="text-gray-400">
          Conecte-se com técnicos especializados para resolver seus problemas de empilhadeira remotamente.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Buscar técnico
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome, especialidade ou problema..."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Especialidade */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Especialidade
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty === 'Todas' ? '' : specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="rating">Melhor Avaliação</option>
              <option value="price">Menor Preço</option>
              <option value="experience">Mais Experiência</option>
              <option value="responseTime">Resposta Mais Rápida</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Avaliação mínima */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Avaliação mínima: {minRating > 0 ? `${minRating}+ estrelas` : 'Qualquer'}
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Preço máximo */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Preço máximo: R$ {maxPrice}/hora
            </label>
            <input
              type="range"
              min="50"
              max="200"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Disponível agora */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="availableOnly"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 text-primary-500 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
            />
            <label htmlFor="availableOnly" className="ml-2 text-gray-300 text-sm">
              Apenas disponíveis agora
            </label>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">
          {filteredTechnicians.length} técnico{filteredTechnicians.length !== 1 ? 's' : ''} encontrado{filteredTechnicians.length !== 1 ? 's' : ''}
        </h2>
        
        {filteredTechnicians.length > 0 && (
          <div className="text-sm text-gray-400">
            {filteredTechnicians.filter(t => t.isAvailable).length} disponível{filteredTechnicians.filter(t => t.isAvailable).length !== 1 ? 'eis' : ''} agora
          </div>
        )}
      </div>

      {/* Lista de técnicos */}
      {filteredTechnicians.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-white mb-2">Nenhum técnico encontrado</h3>
          <p className="text-gray-400 mb-6">
            Tente ajustar seus filtros ou buscar por outro termo.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialty('');
              setMinRating(0);
              setMaxPrice(200);
              setAvailableOnly(false);
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechnicians.map((technician) => (
            <div
              key={technician.id}
              className={`bg-gray-800 rounded-lg p-6 border-2 transition-all duration-300 hover:scale-105 ${
                technician.isAvailable 
                  ? 'border-green-500/30 hover:border-green-500/50' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Header do card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                      {technician.profileImage ? (
                        <img
                          src={technician.profileImage}
                          alt={technician.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {technician.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                      technician.isAvailable ? 'bg-green-400' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{technician.name}</h3>
                    <p className="text-sm text-gray-400">{technician.location}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-white">R$ {technician.hourlyRate}</div>
                  <div className="text-xs text-gray-400">/hora</div>
                </div>
              </div>

              {/* Avaliação e estatísticas */}
              <div className="mb-4">
                {renderStars(technician.rating)}
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                  <span>{technician.totalSessions} sessões</span>
                  <span>{technician.experience} anos exp.</span>
                  <span>~{technician.responseTime}min resposta</span>
                </div>
              </div>

              {/* Especialidades */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {technician.specialties.slice(0, 2).map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-primary-500/20 text-primary-300 px-2 py-1 rounded text-xs font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                  {technician.specialties.length > 2 && (
                    <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      +{technician.specialties.length - 2}
                    </span>
                  )}
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {technician.bio}
              </p>

              {/* Status */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  technician.isAvailable
                    ? 'bg-green-900/30 text-green-300'
                    : 'bg-gray-900/30 text-gray-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    technician.isAvailable ? 'bg-green-400' : 'bg-gray-500'
                  }`}></div>
                  {technician.isAvailable ? 'Disponível agora' : 'Ocupado'}
                </span>
              </div>

              {/* Ações */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewProfile(technician.id)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Ver Perfil
                </button>
                <button
                  onClick={() => handleScheduleSession(technician.id)}
                  disabled={!technician.isAvailable}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    technician.isAvailable
                      ? 'bg-primary-500 hover:bg-primary-600 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {technician.isAvailable ? 'Conectar' : 'Agendar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechniciansPage;