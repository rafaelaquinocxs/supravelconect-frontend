import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Session {
  id: string;
  clientId?: string;
  clientName?: string;
  technicianId?: string;
  technicianName?: string;
  specialtyId: string;
  specialtyName: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  scheduledAt: string;
  duration?: number;
  rating?: number;
  feedback?: string;
}

interface UpcomingSessionCardProps {
  session: Session;
}

const UpcomingSessionCard: React.FC<UpcomingSessionCardProps> = ({ session }) => {
  // Formatar data
  const formattedDate = format(new Date(session.scheduledAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  
  return (
    <div className="bg-dark-300 rounded-lg p-4 border border-gray-800 hover:border-primary-600 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{session.specialtyName}</h3>
          <p className="text-gray-400 text-sm">{formattedDate}</p>
        </div>
        <div className="bg-blue-900/30 text-blue-300 border border-blue-800 px-3 py-1 rounded-full text-xs font-medium">
          Agendada
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-300">
          <span className="font-semibold">
            {session.technicianName ? `Técnico: ${session.technicianName}` : `Cliente: ${session.clientName}`}
          </span>
        </p>
      </div>
      
      <div className="flex space-x-2">
        <Link 
          to={`/call/${session.id}`}
          className="btn btn-primary flex-1 py-2 flex justify-center items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Entrar na Chamada
        </Link>
        <Link 
          to={`/app/sessions/${session.id}`}
          className="btn btn-outline py-2"
        >
          Detalhes
        </Link>
      </div>
    </div>
  );
};

export default UpcomingSessionCard;
