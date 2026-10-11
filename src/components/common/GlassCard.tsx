import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverEffect = false 
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-5 border transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-lg hover:-translate-y-0.5 hover:border-teal-500/30 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
