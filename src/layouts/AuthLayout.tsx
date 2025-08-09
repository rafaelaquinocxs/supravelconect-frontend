import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-500">
            Supravel Connect
          </h1>
          <p className="mt-2 text-gray-400">
            Conectando técnicos especializados
          </p>
        </div>
        
        <div className="bg-dark-800 rounded-lg shadow-xl p-8">
          <Outlet />
        </div>
        
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Supravel Connect. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
