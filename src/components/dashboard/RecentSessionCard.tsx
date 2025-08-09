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

interface RecentSessionCardProps {
  session: Session;
}

const RecentSessionCard: React.FC<RecentSessionCardProps> = ({ session }) => {
  // Formatar data
  const formattedDate = format(new Date(session.scheduledAt), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  
  // Definir cores baseadas no status
  const statusColors = {
    'scheduled': 'bg-blue-900/30 text-blue-300 border-blue-800',
    'in-progress': 'bg-yellow-900/30 text-yellow-300 border-yellow-800',
    'completed': 'bg-green-900/30 text-green-300 border-green-800',
    'cancelled': 'bg-red-900/30 text-red-300 border-red-800'
  };
  
  const statusLabels = {
    'scheduled': 'Agendada',
    'in-progress': 'Em andamento',
    'completed': 'Concluída',
    'cancelled': 'Cancelada'
  };
  
  return (
    <div className="bg-dark-300 rounded-lg p-4 border border-gray-800 hover:border-primary-600 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{session.specialtyName}</h3>
          <p className="text-gray-400 text-sm">{formattedDate}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[session.status]}`}>
          {statusLabels[session.status]}
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-gray-300">
          <span className="font-semibold">
            {session.technicianName ? `Técnico: ${session.technicianName}` : `Cliente: ${session.clientName}`}
          </span>
        </p>
        {session.duration && (
          <p className="text-gray-400 text-sm">
            Duração: {session.duration} minutos
          </p>
        )}
      </div>
      
      {session.rating && (
        <div className="mb-3">
          <div className="flex items-center">
            <span className="text-gray-400 mr-2">Avaliação:</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i}
                  className={`w-4 h-4 ${i < session.rating! ? 'text-yellow-500' : 'text-gray-600'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          {session.feedback && (
            <p className="text-gray-400 text-sm mt-1 italic">
              "{session.feedback}"
            </p>
          )}
        </div>
      )}
      
      <div className="mt-4">
        <Link 
          to={`/app/sessions/${session.id}`}
          className="text-primary-500 hover:text-primary-400 text-sm font-medium"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
};

export default RecentSessionCard;
