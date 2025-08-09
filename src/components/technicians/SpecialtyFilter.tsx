import React from 'react';

interface SpecialtyFilterProps {
  specialty: {
    id: string;
    name: string;
  };
  selected: boolean;
  onChange: () => void;
}

const SpecialtyFilter: React.FC<SpecialtyFilterProps> = ({ specialty, selected, onChange }) => {
  return (
    <button
      type="button"
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        selected 
          ? 'bg-primary-600 text-white' 
          : 'bg-dark-200 text-gray-300 hover:bg-dark-100'
      }`}
      onClick={onChange}
    >
      {specialty.name}
    </button>
  );
};

export default SpecialtyFilter;
