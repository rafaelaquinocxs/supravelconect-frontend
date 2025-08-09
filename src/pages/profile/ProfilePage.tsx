import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: 'client' | 'technician';
  // Campos específicos do cliente
  company?: string;
  credits?: number;
  subscriptionPlan?: string;
  // Campos específicos do técnico
  specialties?: string[];
  experience?: number;
  hourlyRate?: number;
  bio?: string;
  certifications?: string[];
  bankInfo?: {
    bank: string;
    agency: string;
    account: string;
    accountType: 'checking' | 'savings';
    pixKey?: string;
  };
}

const SPECIALTIES = [
  'Elétrica',
  'Hidráulica', 
  'Motor',
  'Transmissão',
  'Sistemas Eletrônicos',
  'Manutenção Preventiva'
];

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Carregar dados do perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/api/users/profile');
        setProfile(response.data.data);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast.error('Erro ao carregar dados do perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Atualizar campo do perfil
  const updateField = (field: string, value: any) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      [field]: value
    });
  };

  // Atualizar campo aninhado (bankInfo)
  const updateNestedField = (parent: string, field: string, value: any) => {
    if (!profile) return;
    
    setProfile({
      ...profile,
      [parent]: {
        ...(profile as any)[parent],
        [field]: value
      }
    });
  };

  // Salvar perfil
  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    
    try {
      const response = await api.put('/api/users/profile', profile);
      setProfile(response.data.data);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  // Upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      const response = await api.post('/api/users/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      updateField('profileImage', response.data.data.profileImage);
      toast.success('Imagem atualizada com sucesso!');
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Erro ao carregar perfil</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-6">
          {/* Foto do perfil */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {profile.profileImage ? (
                <img 
                  src={profile.profileImage} 
                  alt="Perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-300">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-2 cursor-pointer hover:bg-primary-600 transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Informações básicas */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
            <p className="text-gray-400">{profile.email}</p>
            <div className="flex items-center mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                profile.role === 'technician' 
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                  : 'bg-green-900/30 text-green-300 border border-green-800'
              }`}>
                {profile.role === 'technician' ? 'Técnico' : 'Cliente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 rounded-lg mb-6">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Dados Pessoais
            </button>
            {profile.role === 'technician' && (
              <>
                <button
                  onClick={() => setActiveTab('professional')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'professional'
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Dados Profissionais
                </button>
                <button
                  onClick={() => setActiveTab('financial')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'financial'
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Dados Bancários
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="p-6">
          {/* Dados Pessoais */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Nome completo</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full bg-gray-600 border border-gray-600 rounded-lg px-4 py-2 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Telefone</label>
                  <input
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {profile.role === 'client' && (
                  <div>
                    <label className="block text-gray-300 mb-2">Empresa</label>
                    <input
                      type="text"
                      value={profile.company || ''}
                      onChange={(e) => updateField('company', e.target.value)}
                      placeholder="Nome da empresa"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dados Profissionais (Técnico) */}
          {activeTab === 'professional' && profile.role === 'technician' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Experiência (anos)</label>
                  <input
                    type="number"
                    value={profile.experience || 0}
                    onChange={(e) => updateField('experience', parseInt(e.target.value))}
                    min="0"
                    max="50"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Valor por hora (R$)</label>
                  <input
                    type="number"
                    value={profile.hourlyRate || 80}
                    onChange={(e) => updateField('hourlyRate', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Especialidades</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SPECIALTIES.map((specialty) => (
                    <label key={specialty} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.specialties?.includes(specialty) || false}
                        onChange={(e) => {
                          const currentSpecialties = profile.specialties || [];
                          if (e.target.checked) {
                            updateField('specialties', [...currentSpecialties, specialty]);
                          } else {
                            updateField('specialties', currentSpecialties.filter(s => s !== specialty));
                          }
                        }}
                        className="w-4 h-4 bg-gray-700 border border-gray-600 rounded focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-300 text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Biografia</label>
                <textarea
                  value={profile.bio || ''}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Conte um pouco sobre sua experiência e especialidades..."
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Dados Bancários (Técnico) */}
          {activeTab === 'financial' && profile.role === 'technician' && (
            <div className="space-y-6">
              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-300 font-semibold mb-2">💰 Informações Bancárias</h3>
                <p className="text-blue-200 text-sm">
                  Essas informações são necessárias para receber seus pagamentos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-300 mb-2">Banco</label>
                  <input
                    type="text"
                    value={profile.bankInfo?.bank || ''}
                    onChange={(e) => updateNestedField('bankInfo', 'bank', e.target.value)}
                    placeholder="Ex: Banco do Brasil"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Agência</label>
                  <input
                    type="text"
                    value={profile.bankInfo?.agency || ''}
                    onChange={(e) => updateNestedField('bankInfo', 'agency', e.target.value)}
                    placeholder="0000"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Conta</label>
                  <input
                    type="text"
                    value={profile.bankInfo?.account || ''}
                    onChange={(e) => updateNestedField('bankInfo', 'account', e.target.value)}
                    placeholder="00000-0"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">Tipo de conta</label>
                  <select
                    value={profile.bankInfo?.accountType || 'checking'}
                    onChange={(e) => updateNestedField('bankInfo', 'accountType', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Poupança</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-2">Chave PIX (opcional)</label>
                  <input
                    type="text"
                    value={profile.bankInfo?.pixKey || ''}
                    onChange={(e) => updateNestedField('bankInfo', 'pixKey', e.target.value)}
                    placeholder="CPF, email, telefone ou chave aleatória"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {saving ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Salvando...
            </span>
          ) : (
            'Salvar Alterações'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;