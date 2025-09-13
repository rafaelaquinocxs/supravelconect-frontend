import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface ServiceProviderProfile {
  isServiceProvider: boolean;
  specialties: string[];
  subSpecialties: string[];
  description: string;
  experience: number;
  certifications: string[];
  hourlyRate: number;
  responseTime: string;
  isAvailable: boolean;
  location: string;
  workingHours?: {
    start: string;
    end: string;
    days: string[];
  };
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  serviceProvider: ServiceProviderProfile;
}

interface Category {
  id: string;
  name: string;
  description: string;
  group: string;
}

// 80 Categorias técnicas do Supravel Connect
const CATEGORIES: Category[] = [
  // Núcleo Industrial Pesado
  { id: 'eletrotecnica', name: 'Eletrotécnica', description: 'Painéis elétricos, motores, inversores', group: 'Núcleo Industrial Pesado' },
  { id: 'mecanica_industrial', name: 'Mecânica Industrial', description: 'Máquinas industriais, linhas de produção', group: 'Núcleo Industrial Pesado' },
  { id: 'eletromecanica', name: 'Eletromecânica', description: 'Interface elétrica e mecânica', group: 'Núcleo Industrial Pesado' },
  { id: 'automacao_industrial', name: 'Automação Industrial', description: 'CLP, sensores, redes industriais', group: 'Núcleo Industrial Pesado' },
  { id: 'cnc_tornos', name: 'CNC – Tornos', description: 'Programação e manutenção de tornos CNC', group: 'Núcleo Industrial Pesado' },
  { id: 'cnc_centros_usinagem', name: 'CNC – Centros de Usinagem', description: 'Centros de usinagem CNC', group: 'Núcleo Industrial Pesado' },
  { id: 'cnc_fresadoras', name: 'CNC – Fresadoras', description: 'Fresadoras CNC', group: 'Núcleo Industrial Pesado' },
  { id: 'injetoras_plastico', name: 'Injetoras de Plástico', description: 'Manutenção de injetoras plásticas', group: 'Núcleo Industrial Pesado' },
  { id: 'extrusoras_sopradoras', name: 'Extrusoras / Sopradoras', description: 'Máquinas de extrusão e sopro', group: 'Núcleo Industrial Pesado' },
  { id: 'compressores_industriais', name: 'Compressores Industriais', description: 'Compressores de ar e gás', group: 'Núcleo Industrial Pesado' },
  { id: 'caldeiras_sistemas_termicos', name: 'Caldeiras e Sistemas Térmicos', description: 'Caldeiras, vapor e aquecimento', group: 'Núcleo Industrial Pesado' },
  { id: 'soldagem_industrial', name: 'Soldagem Industrial', description: 'MIG, TIG, eletrodo revestido', group: 'Núcleo Industrial Pesado' },
  { id: 'robos_solda', name: 'Robôs de Solda', description: 'Robótica aplicada à soldagem', group: 'Núcleo Industrial Pesado' },

  // Movimentação de Cargas / Logística
  { id: 'empilhadeira_eletrica', name: 'Empilhadeira Elétrica', description: 'Empilhadeiras elétricas e baterias', group: 'Movimentação de Cargas' },
  { id: 'empilhadeira_combustao', name: 'Empilhadeira a Combustão', description: 'Empilhadeiras GLP/Diesel', group: 'Movimentação de Cargas' },
  { id: 'paleteiras_eletricas', name: 'Paleteiras Elétricas', description: 'Paleteiras elétricas', group: 'Movimentação de Cargas' },
  { id: 'reach_trucks', name: 'Reach Trucks', description: 'Reach trucks para armazéns', group: 'Movimentação de Cargas' },
  { id: 'order_pickers', name: 'Order Pickers', description: 'Equipamentos de coleta em altura', group: 'Movimentação de Cargas' },
  { id: 'plataformas_trabalho_aereo', name: 'Plataformas de Trabalho Aéreo', description: 'Tesoura e articuladas', group: 'Movimentação de Cargas' },

  // Energia e Sustentabilidade
  { id: 'geradores_industriais', name: 'Geradores Industriais', description: 'Grupos geradores a diesel/gás', group: 'Energia e Sustentabilidade' },
  { id: 'nobreaks_bancos_baterias', name: 'Nobreaks / Bancos de Baterias', description: 'UPS e baterias estacionárias', group: 'Energia e Sustentabilidade' },
  { id: 'transformadores_subestacoes', name: 'Transformadores / Subestações', description: 'Montagem e manutenção de subestações', group: 'Energia e Sustentabilidade' },
  { id: 'energia_solar', name: 'Energia Solar', description: 'Sistemas fotovoltaicos', group: 'Energia e Sustentabilidade' },
  { id: 'energia_eolica', name: 'Energia Eólica', description: 'Sistemas eólicos', group: 'Energia e Sustentabilidade' },
  { id: 'estacoes_carregamento_ve', name: 'Estações de Carregamento VE', description: 'Carregadores para veículos elétricos', group: 'Energia e Sustentabilidade' },
  { id: 'bess_armazenamento_baterias', name: 'BESS – Armazenamento em Baterias', description: 'Sistemas de baterias de lítio', group: 'Energia e Sustentabilidade' },
  { id: 'turbinas_gas', name: 'Turbinas a Gás', description: 'Turbinas para geração termoelétrica', group: 'Energia e Sustentabilidade' },

  // Refrigeração e Climatização
  { id: 'chillers_industriais', name: 'Chillers Industriais', description: 'Sistemas de resfriamento industrial', group: 'Refrigeração e Climatização' },
  { id: 'hvac', name: 'HVAC', description: 'Climatização central e industrial', group: 'Refrigeração e Climatização' },
  { id: 'camaras_frias', name: 'Câmaras Frias', description: 'Câmaras frias e refrigeração comercial', group: 'Refrigeração e Climatização' },
  { id: 'climatizacao_residencial_comercial', name: 'Climatização Residencial/Comercial', description: 'Ar condicionado split, multisplit, VRF', group: 'Refrigeração e Climatização' },
  { id: 'torres_resfriamento', name: 'Torres de Resfriamento', description: 'Torres de resfriamento de processos', group: 'Refrigeração e Climatização' },

  // Automotivo / Transporte
  { id: 'mecanica_automotiva_geral', name: 'Mecânica Automotiva Geral', description: 'Manutenção de veículos leves', group: 'Automotivo / Transporte' },
  { id: 'eletrica_automotiva', name: 'Elétrica Automotiva', description: 'Sistemas elétricos veiculares', group: 'Automotivo / Transporte' },
  { id: 'injecao_eletronica', name: 'Injeção Eletrônica', description: 'Diagnóstico e manutenção de injeção', group: 'Automotivo / Transporte' },
  { id: 'mecanica_diesel', name: 'Mecânica Diesel', description: 'Manutenção de caminhões e ônibus', group: 'Automotivo / Transporte' },
  { id: 'funilaria_pintura', name: 'Funilaria e Pintura', description: 'Reparos estruturais e pintura', group: 'Automotivo / Transporte' },
  { id: 'alinhamento_balanceamento', name: 'Alinhamento e Balanceamento', description: 'Geometria e balanceamento', group: 'Automotivo / Transporte' },
  { id: 'transmissao_cambio', name: 'Transmissão / Câmbio', description: 'Câmbios manuais e automáticos', group: 'Automotivo / Transporte' },
  { id: 'veiculos_eletricos_hibridos', name: 'Veículos Elétricos / Híbridos', description: 'Baterias e sistemas de alta tensão', group: 'Automotivo / Transporte' },

  // Construção e Terraplenagem
  { id: 'pa_carregadeira', name: 'Pá Carregadeira', description: 'Manutenção de pás carregadeiras', group: 'Construção e Terraplenagem' },
  { id: 'escavadeira_hidraulica', name: 'Escavadeira Hidráulica', description: 'Escavadeiras de grande porte', group: 'Construção e Terraplenagem' },
  { id: 'motoniveladora_patrol', name: 'Motoniveladora / Patrol', description: 'Patrols/motoniveladoras', group: 'Construção e Terraplenagem' },
  { id: 'retroescavadeira', name: 'Retroescavadeira', description: 'Retroescavadeiras em obras civis', group: 'Construção e Terraplenagem' },
  { id: 'rolo_compactador', name: 'Rolo Compactador', description: 'Rolos de compactação', group: 'Construção e Terraplenagem' },
  { id: 'tratores_esteira', name: 'Tratores de Esteira', description: 'Tratores esteira para terraplenagem', group: 'Construção e Terraplenagem' },

  // Agricultura e Agroindústria
  { id: 'tratores_agricolas', name: 'Tratores Agrícolas', description: 'Manutenção de tratores agrícolas', group: 'Agricultura e Agroindústria' },
  { id: 'colheitadeiras', name: 'Colheitadeiras', description: 'Colheitadeiras de grãos', group: 'Agricultura e Agroindústria' },
  { id: 'pulverizadores', name: 'Pulverizadores', description: 'Pulverizadores autopropelidos e costais', group: 'Agricultura e Agroindústria' },
  { id: 'plantadeiras_semeadoras', name: 'Plantadeiras / Semeadoras', description: 'Semeadoras e plantadeiras', group: 'Agricultura e Agroindústria' },
  { id: 'ensiladeiras', name: 'Ensiladeiras', description: 'Ensiladeiras agrícolas', group: 'Agricultura e Agroindústria' },
  { id: 'sistemas_irrigacao', name: 'Sistemas de Irrigação', description: 'Bombas e sistemas de irrigação', group: 'Agricultura e Agroindústria' },
  { id: 'secadores_graos', name: 'Secadores de Grãos', description: 'Secadores e sistemas de armazenagem', group: 'Agricultura e Agroindústria' },

  // Comércio e Serviços
  { id: 'balancas_comerciais', name: 'Balanças Comerciais', description: 'Balanças de precisão e uso comercial', group: 'Comércio e Serviços' },
  { id: 'fornos_panificacao', name: 'Fornos e Panificação', description: 'Fornos de padaria e pizzaria', group: 'Comércio e Serviços' },
  { id: 'maquinas_cafe', name: 'Máquinas de Café', description: 'Máquinas de café profissionais', group: 'Comércio e Serviços' },
  { id: 'lavanderia_comercial', name: 'Lavanderia Comercial', description: 'Máquinas de lavar e lava-louças industriais', group: 'Comércio e Serviços' },
  { id: 'impressoras_fiscais_pdv', name: 'Impressoras Fiscais e PDV', description: 'Impressoras fiscais, sistemas de checkout', group: 'Comércio e Serviços' },
  { id: 'portas_automaticas_esteiras', name: 'Portas Automáticas / Esteiras', description: 'Portas automáticas, esteiras rolantes', group: 'Comércio e Serviços' },

  // Automação Predial / Residencial / Comercial
  { id: 'automacao_residencial', name: 'Automação Residencial', description: 'Casas inteligentes, iluminação, áudio, IoT', group: 'Automação Predial' },
  { id: 'automacao_comercial', name: 'Automação Comercial', description: 'Sistemas de automação de edifícios e comércio', group: 'Automação Predial' },
  { id: 'cftv_controle_acesso', name: 'CFTV / Controle de Acesso', description: 'Sistemas de câmeras e controle de acesso', group: 'Automação Predial' },
  { id: 'alarmes_sensores', name: 'Alarmes e Sensores', description: 'Alarmes e sensores inteligentes', group: 'Automação Predial' },
  { id: 'bms_gestao_predial', name: 'BMS – Gestão Predial', description: 'Sistemas de automação predial (BMS)', group: 'Automação Predial' },
  { id: 'sistemas_incendio', name: 'Sistemas de Incêndio', description: 'Sprinklers e combate a incêndios', group: 'Automação Predial' },
  { id: 'elevadores_escadas_rolantes', name: 'Elevadores / Escadas Rolantes', description: 'Manutenção de elevadores e escadas rolantes', group: 'Automação Predial' },

  // Saúde e Equipamentos Médico-Hospitalares
  { id: 'diagnostico_imagem', name: 'Diagnóstico por Imagem', description: 'Raio-X, tomógrafos, ultrassons', group: 'Saúde e Equipamentos Médicos' },
  { id: 'equipamentos_hospitalares', name: 'Equipamentos Hospitalares', description: 'Ventiladores, monitores e bombas de infusão', group: 'Saúde e Equipamentos Médicos' },
  { id: 'equipamentos_laboratoriais', name: 'Equipamentos Laboratoriais', description: 'Centrífugas, autoclaves e analisadores', group: 'Saúde e Equipamentos Médicos' },

  // Infraestrutura Estratégica
  { id: 'telecomunicacoes', name: 'Telecomunicações', description: 'Torres, rádio, fibra óptica e redes móveis', group: 'Infraestrutura Estratégica' },
  { id: 'data_centers', name: 'Data Centers', description: 'UPS, climatização e racks de TI', group: 'Infraestrutura Estratégica' },
  { id: 'cabeamento_estruturado', name: 'Cabeamento Estruturado', description: 'Redes estruturadas e TI', group: 'Infraestrutura Estratégica' },
  { id: 'petroleo_gas', name: 'Petróleo & Gás', description: 'Instrumentação e compressores', group: 'Infraestrutura Estratégica' },
  { id: 'gas_industrial_comercial', name: 'Gás Industrial e Comercial', description: 'Redes de gás, GLP e tubulações', group: 'Infraestrutura Estratégica' },
  { id: 'mineracao', name: 'Mineração', description: 'Perfuratrizes, correias transportadoras, britadores', group: 'Infraestrutura Estratégica' },
  { id: 'portuario', name: 'Portuário', description: 'Guindastes RTG, STS, reachstackers', group: 'Infraestrutura Estratégica' },
  { id: 'ferroviario', name: 'Ferroviário', description: 'Locomotivas, vagões e sinalização', group: 'Infraestrutura Estratégica' },

  // Serviços de Apoio e Comunidade
  { id: 'treinamentos_certificacoes', name: 'Treinamentos e Certificações', description: 'NR-10, NR-12, NR-35, treinamentos fabricantes', group: 'Serviços de Apoio' },
  { id: 'consultorias_projetos', name: 'Consultorias e Projetos', description: 'Retrofit, eficiência energética, layout industrial', group: 'Serviços de Apoio' },
  { id: 'comunidade_tecnica', name: 'Comunidade Técnica', description: 'Fórum, biblioteca e eventos para técnicos', group: 'Serviços de Apoio' }
];

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'provider'>('personal');
  
  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
    serviceProvider: {
      isServiceProvider: user?.serviceProvider?.isServiceProvider || false,
      specialties: user?.serviceProvider?.specialties || [],
      subSpecialties: user?.serviceProvider?.subSpecialties || [],
      description: user?.serviceProvider?.description || '',
      experience: user?.serviceProvider?.experience || 0,
      certifications: user?.serviceProvider?.certifications || [],
      hourlyRate: user?.serviceProvider?.hourlyRate || 0,
      responseTime: user?.serviceProvider?.responseTime || '24h',
      isAvailable: user?.serviceProvider?.isAvailable || false,
      location: user?.serviceProvider?.location || '',
      workingHours: user?.serviceProvider?.workingHours || {
        start: '08:00',
        end: '18:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    }
  });

  const handlePersonalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/api/auth/me', {
        name: profile.name,
        phone: profile.phone
      });

      if (response.data.success) {
        toast.success('Perfil atualizado com sucesso!');
        updateUser(response.data.data);
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar perfil');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/api/auth/service-provider', profile.serviceProvider);

      if (response.data.success) {
        toast.success('Perfil de prestador atualizado com sucesso!');
        updateUser(response.data.user);
      } else {
        throw new Error(response.data.message || 'Erro ao atualizar perfil de prestador');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil de prestador:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil de prestador');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProviderChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      serviceProvider: {
        ...prev.serviceProvider,
        [field]: value
      }
    }));
  };

  const handleSpecialtyToggle = (specialtyId: string) => {
    const currentSpecialties = profile.serviceProvider.specialties;
    const newSpecialties = currentSpecialties.includes(specialtyId)
      ? currentSpecialties.filter(id => id !== specialtyId)
      : [...currentSpecialties, specialtyId];
    
    handleProviderChange('specialties', newSpecialties);
  };

  const handleWorkingHoursChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      serviceProvider: {
        ...prev.serviceProvider,
        workingHours: {
          ...prev.serviceProvider.workingHours!,
          [field]: value
        }
      }
    }));
  };

  const responseTimeOptions = [
    { value: '1h', label: '1 hora' },
    { value: '2h', label: '2 horas' },
    { value: '4h', label: '4 horas' },
    { value: '8h', label: '8 horas' },
    { value: '12h', label: '12 horas' },
    { value: '24h', label: '24 horas' },
    { value: '48h', label: '48 horas' }
  ];

  // Agrupar categorias por grupo
  const groupedCategories = CATEGORIES.reduce((acc, category) => {
    if (!acc[category.group]) {
      acc[category.group] = [];
    }
    acc[category.group].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>

          {/* Tabs */}
          <div className="flex space-x-1 mb-8">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'personal'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Dados Pessoais
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'provider'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Perfil de Prestador
            </button>
          </div>

          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Informações Pessoais</h2>
              
              <form onSubmit={handlePersonalSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    className="w-full px-4 py-3 bg-gray-600 border border-gray-600 rounded-lg cursor-not-allowed"
                    disabled
                  />
                  <p className="text-sm text-gray-400 mt-1">O email não pode ser alterado</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </form>
            </div>
          )}

          {/* Provider Tab */}
          {activeTab === 'provider' && (
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Perfil de Prestador de Serviços</h2>
              
              <form onSubmit={handleProviderSubmit} className="space-y-6">
                {/* Toggle Prestador */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isServiceProvider"
                    checked={profile.serviceProvider.isServiceProvider}
                    onChange={(e) => handleProviderChange('isServiceProvider', e.target.checked)}
                    className="w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="isServiceProvider" className="text-lg font-medium">
                    Quero ser um prestador de serviços
                  </label>
                </div>

                {profile.serviceProvider.isServiceProvider && (
                  <>
                    {/* Valor por Hora */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Valor por Hora (R$) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={profile.serviceProvider.hourlyRate}
                        onChange={(e) => handleProviderChange('hourlyRate', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Tempo de Resposta */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Tempo de Resposta</label>
                      <select
                        value={profile.serviceProvider.responseTime}
                        onChange={(e) => handleProviderChange('responseTime', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        {responseTimeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Localização */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Localização *</label>
                      <input
                        type="text"
                        value={profile.serviceProvider.location}
                        onChange={(e) => handleProviderChange('location', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ex: São Paulo, SP"
                        required
                      />
                    </div>

                    {/* Certificações */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Certificações</label>
                      <input
                        type="text"
                        value={profile.serviceProvider.certifications.join(', ')}
                        onChange={(e) => handleProviderChange('certifications', e.target.value.split(', ').filter(cert => cert.trim()))}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ex: NPI, NR-10, NR-12"
                      />
                    </div>

                    {/* Horário de Trabalho */}
                    <div>
                      <label className="block text-sm font-medium mb-4">Horário de Trabalho</label>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Início</label>
                          <input
                            type="time"
                            value={profile.serviceProvider.workingHours?.start || '08:00'}
                            onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Fim</label>
                          <input
                            type="time"
                            value={profile.serviceProvider.workingHours?.end || '18:00'}
                            onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Especialidades */}
                    <div>
                      <label className="block text-sm font-medium mb-4">Especialidades Técnicas * ({profile.serviceProvider.specialties.length} selecionadas)</label>
                      <div className="max-h-96 overflow-y-auto border border-gray-600 rounded-lg p-4">
                        {Object.entries(groupedCategories).map(([groupName, categories]) => (
                          <div key={groupName} className="mb-6">
                            <h3 className="text-lg font-semibold text-red-400 mb-3">{groupName}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {categories.map((category) => (
                                <div key={category.id} className="flex items-start space-x-3 p-2 hover:bg-gray-700 rounded">
                                  <input
                                    type="checkbox"
                                    id={category.id}
                                    checked={profile.serviceProvider.specialties.includes(category.id)}
                                    onChange={() => handleSpecialtyToggle(category.id)}
                                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 mt-1"
                                  />
                                  <div className="flex-1">
                                    <label htmlFor={category.id} className="text-sm font-medium text-gray-200 cursor-pointer">
                                      {category.name}
                                    </label>
                                    <p className="text-xs text-gray-400 mt-1">{category.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {profile.serviceProvider.specialties.length === 0 && (
                        <p className="text-sm text-red-400 mt-2">Selecione pelo menos uma especialidade</p>
                      )}
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading || (profile.serviceProvider.isServiceProvider && profile.serviceProvider.specialties.length === 0)}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Salvando...' : 'Salvar Perfil de Prestador'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
