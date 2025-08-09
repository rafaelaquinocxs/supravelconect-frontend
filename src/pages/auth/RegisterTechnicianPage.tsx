import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const SPECIALTIES = [
  'Elétrica',
  'Hidráulica', 
  'Motor',
  'Transmissão',
  'Sistemas Eletrônicos',
  'Manutenção Preventiva'
];

const RegisterTechnicianPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialties: [] as string[],
    experience: '',
    acceptTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'acceptTerms') {
        setFormData({
          ...formData,
          [name]: checked
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSpecialtyChange = (specialty: string) => {
    const isSelected = formData.specialties.includes(specialty);
    
    if (isSelected) {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter(s => s !== specialty)
      });
    } else {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (formData.specialties.length === 0) {
      toast.error('Selecione pelo menos uma especialidade');
      return;
    }
    
    if (!formData.experience || parseInt(formData.experience) < 0) {
      toast.error('Informe sua experiência em anos');
      return;
    }
    
    if (!formData.acceptTerms) {
      toast.error('Você precisa aceitar os termos de uso');
      return;
    }
    
    setLoading(true);
    
    try {
      // Registrar como técnico
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'technician',
        specialties: formData.specialties,
        experience: parseInt(formData.experience)
      };
      
      await register(userData);
      toast.success('Cadastro realizado! Aguarde aprovação do administrador.');
      navigate('/auth/login');
    } catch (err) {
      console.error('Erro ao registrar:', err);
      // O erro já será tratado pelo contexto de autenticação
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-2xl font-bold text-center">Cadastre-se como Técnico</h2>
        <p className="text-gray-400 text-center mt-2">
          Conecte-se com clientes que precisam de seus serviços
        </p>
      </div>
      <div className="card-body">
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-300 mb-2">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="input"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-300 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="input"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-300 mb-2">
              Telefone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="input"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="experience" className="block text-gray-300 mb-2">
              Experiência (anos) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="experience"
              name="experience"
              className="input"
              placeholder="Ex: 5"
              value={formData.experience}
              onChange={handleChange}
              min="0"
              max="50"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">
              Especialidades <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-400 text-sm mb-3">Selecione suas áreas de especialização:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SPECIALTIES.map((specialty) => (
                <div key={specialty} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`specialty-${specialty}`}
                    checked={formData.specialties.includes(specialty)}
                    onChange={() => handleSpecialtyChange(specialty)}
                    className="w-4 h-4 bg-dark-300 border border-gray-700 rounded focus:ring-primary-500"
                  />
                  <label 
                    htmlFor={`specialty-${specialty}`} 
                    className="ml-2 text-gray-300 text-sm cursor-pointer"
                  >
                    {specialty}
                  </label>
                </div>
              ))}
            </div>
            {formData.specialties.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-400">
                  Selecionadas: {formData.specialties.join(', ')}
                </p>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-300 mb-2">
              Senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">
              Confirmar senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  className="w-4 h-4 bg-dark-300 border border-gray-700 rounded focus:ring-primary-500"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="acceptTerms" className="text-gray-300">
                  Eu concordo com os <a href="#" className="text-primary-500 hover:text-primary-400">Termos de Serviço</a> e <a href="#" className="text-primary-500 hover:text-primary-400">Política de Privacidade</a>
                </label>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded">
            <h4 className="text-blue-300 font-semibold mb-2">📋 Processo de Aprovação</h4>
            <p className="text-blue-200 text-sm">
              Após o cadastro, sua conta será analisada por nossa equipe. Você receberá um email quando for aprovado e poderá começar a atender clientes.
            </p>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cadastrando...
              </span>
            ) : (
              'Cadastrar como Técnico'
            )}
          </button>
        </form>
      </div>
      <div className="card-footer text-center">
        <p className="text-gray-400">
          Já tem uma conta?{' '}
          <Link to="/auth/login" className="text-primary-500 hover:text-primary-400">
            Entrar
          </Link>
        </p>
        <p className="text-gray-400 mt-2">
          É um cliente?{' '}
          <Link to="/auth/register" className="text-primary-500 hover:text-primary-400">
            Cadastre-se como cliente
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterTechnicianPage;

