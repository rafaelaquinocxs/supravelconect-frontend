import React from 'react';

interface TechnicianCardProps {
  technician: {
    id: string;
    name: string;
    specialties: {
      id: string;
      name: string;
    }[];
    rating: number;
    totalSessions: number;
    estimatedResponseTime: number;
    isOnline: boolean;
    profileImage?: string;
  };
  onClick: () => void;
}

const TechnicianCard: React.FC<TechnicianCardProps> = ({ technician, onClick }) => {
  return (
    <div 
      className="bg-dark-300 rounded-lg overflow-hidden border border-gray-800 hover:border-primary-600 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden">
              {technician.profileImage ? (
                <img 
                  src={technician.profileImage} 
                  alt={technician.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-900 text-primary-300 text-xl font-bold">
                  {technician.name.charAt(0)}
                </div>
              )}
            </div>
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-dark-300 ${technician.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg">{technician.name}</h3>
            <div className="flex items-center">
              <div className="flex mr-2">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(technician.rating) ? 'text-yellow-500' : 'text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-gray-400 text-sm">
                ({technician.rating.toFixed(1)})
              </span>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {technician.specialties.map(specialty => (
              <span 
                key={specialty.id}
                className="bg-dark-200 text-primary-400 text-xs px-2 py-1 rounded-full"
              >
                {specialty.name}
              </span>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{technician.totalSessions} atendimentos</span>
            <span>Responde em ~{technician.estimatedResponseTime} min</span>
          </div>
        </div>
        
        <button className="btn btn-primary w-full">
          {technician.isOnline ? 'Chamar Agora' : 'Ver Detalhes'}
        </button>
      </div>
    </div>
  );
};

export default TechnicianCard;
