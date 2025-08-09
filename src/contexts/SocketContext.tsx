import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// API base URL
const API_URL = 'http://localhost:5000';

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Conectar ao socket quando o usuário estiver autenticado
  const connect = () => {
    if (!isAuthenticated || !user) return;

    const token = localStorage.getItem('token');
    
    if (!token) return;

    const newSocket = io(API_URL, {
      auth: {
        token
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket conectado');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket desconectado');
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('Erro no socket:', error);
      setIsConnected(false);
    });

    setSocket(newSocket);
  };

  // Desconectar do socket
  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  // Conectar ao socket quando o usuário estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    // Limpar socket ao desmontar
    return () => {
      disconnect();
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connect,
        disconnect
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket deve ser usado dentro de um SocketProvider');
  }
  
  return context;
};
