import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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
    
    if (!formData.acceptTerms) {
      toast.error('Você precisa aceitar os termos de uso');
      return;
    }
    
    setLoading(true);
    
    try {
      // Registrar como cliente
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'client'
      };
      
      await register(userData);
      navigate('/app/dashboard');
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
        <h2 className="text-2xl font-bold text-center">Cadastre-se como Cliente</h2>
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
              Telefone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="input"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={handleChange}
            />
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
              'Cadastrar'
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
          É um técnico?{' '}
          <Link to="/auth/register-technician" className="text-primary-500 hover:text-primary-400">
            Cadastre-se como técnico
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
