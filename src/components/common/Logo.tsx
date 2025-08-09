import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', withText = true }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  return (
    <Link to="/" className="flex items-center">
      <div className="flex items-center">
        <div className={`bg-dark-200 rounded-lg p-2 ${sizeClasses[size]}`}>
          <span className="font-bold text-primary-600">SC</span>
        </div>
        {withText && (
          <span className="ml-2 text-xl font-bold">
            Supravel<span className="text-primary-600">Connect</span>
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
