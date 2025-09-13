import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isAuthPage = location.pathname.includes('/auth/');
  const isDashboard = location.pathname.includes('/app/');

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                SC
              </div>
              <span className="text-white font-bold text-xl">
                Supravel<span className="text-primary-500">Connect</span>
              </span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          {!isAuthPage && (
            <nav className="hidden md:flex items-center space-x-8">
              {!user ? (
                // Menu para usuários não logados
                <>
                  <Link
                    to="/"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/') ? 'text-white font-medium' : ''
                    }`}
                  >
                    Início
                  </Link>
                  <Link
                    to="/como-funciona"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/como-funciona') ? 'text-white font-medium' : ''
                    }`}
                  >
                    Como Funciona
                  </Link>
                  <Link
                    to="/especialidades"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/especialidades') ? 'text-white font-medium' : ''
                    }`}
                  >
                    Especialidades
                  </Link>
                  <Link
                    to="/planos"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/planos') ? 'text-white font-medium' : ''
                    }`}
                  >
                    Planos
                  </Link>
                  <Link
                    to="/contato"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/contato') ? 'text-white font-medium' : ''
                    }`}
                  >
                    Contato
                  </Link>
                </>
              ) : isDashboard ? (
                // Menu para usuários logados (SEM ASSINATURA)
                <>
                  <Link
                    to="/app/dashboard"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/app/dashboard') ? 'text-white font-medium' : ''
                    }`}
                  >
                    Painel
                  </Link>
                  <Link
                    to="/app/specialists"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      location.pathname.includes('/app/specialists') || location.pathname.includes('/app/technicians') ? 'text-white font-medium' : ''
                    }`}
                  >
                    Técnicos
                  </Link>
                  <Link
                    to="/app/sessions"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/app/sessions') ? 'text-white font-medium' : ''
                    }`}
                  >
                    Sessões
                  </Link>
                </>
              ) : null}
            </nav>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {!user ? (
              // Botões para usuários não logados
              !isAuthPage && (
                <>
                  <Link
                    to="/auth/login"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/auth/register"
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cadastrar
                  </Link>
                </>
              )
            ) : (
              // Menu do usuário logado
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block font-medium">{user.name}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isProfileMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu (SEM ASSINATURA) */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 py-1 z-50">
                    <Link
                      to="/app/profile"
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Meu Perfil
                    </Link>
                    <Link
                      to="/app/notifications"
                      className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Notificações
                    </Link>
                    <hr className="border-gray-700 my-1" />
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && !isAuthPage && (
          <div className="md:hidden border-t border-gray-800 py-4">
            <nav className="flex flex-col space-y-4">
              {!user ? (
                <>
                  <Link
                    to="/"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/') ? 'text-white font-medium' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Início
                  </Link>
                  <Link
                    to="/como-funciona"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/como-funciona') ? 'text-white font-medium' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Como Funciona
                  </Link>
                  <Link
                    to="/especialidades"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/especialidades') ? 'text-white font-medium' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Especialidades
                  </Link>
                  <Link
                    to="/planos"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/planos') ? 'text-white font-medium' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Planos
                  </Link>
                  <Link
                    to="/contato"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/contato') ? 'text-white font-medium' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contato
                  </Link>
                  <hr className="border-gray-700" />
                  <Link
                    to="/auth/login"
                    className="text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/auth/register"
                    className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cadastrar
                  </Link>
                </>
              ) : isDashboard ? (
                // Menu mobile para usuários logados (SEM ASSINATURA)
                <>
                  <Link
                    to="/app/dashboard"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/app/dashboard') ? 'text-white font-medium' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Painel
                  </Link>
                  <Link
                    to="/app/specialists"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      location.pathname.includes('/app/specialists') || location.pathname.includes('/app/technicians') ? 'text-white font-medium' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Técnicos
                  </Link>
                  <Link
                    to="/app/sessions"
                    className={`text-gray-300 hover:text-white transition-colors ${
                      isActive('/app/sessions') ? 'text-white font-medium' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sessões
                  </Link>
                </>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
