import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-dark-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Redireciona para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Verifica se a rota é apenas para admin
  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;