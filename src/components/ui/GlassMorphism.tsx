import React from 'react';

type GlassMorphismProps = {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  theme?: 'light' | 'dark';
  glowingBorder?: boolean;
};

const GlassMorphism: React.FC<GlassMorphismProps> = ({
  children,
  className = '',
  intensity = 'medium',
  theme = 'light',
  glowingBorder = false,
}) => {
  const intensityStyles = {
    light: {
      light: 'bg-white/50 backdrop-blur-sm border-white/20',
      medium: 'bg-white/80 backdrop-blur-md border-white/20',
      heavy: 'bg-white/90 backdrop-blur-lg border-white/20',
    },
    dark: {
      light: 'bg-gray-900/50 backdrop-blur-sm border-gray-700/30',
      medium: 'bg-gray-900/70 backdrop-blur-md border-gray-700/30',
      heavy: 'bg-gray-900/90 backdrop-blur-lg border-gray-700/30',
    }
  };

  const borderClass = glowingBorder ? 'border-glow' : '';

  return (
    <div className={`rounded-2xl border shadow-xl ${intensityStyles[theme][intensity]} ${borderClass} ${className}`}>
      {children}
    </div>
  );
};

export default GlassMorphism;
