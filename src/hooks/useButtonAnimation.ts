import { useState } from 'react';

interface UseButtonAnimationReturn {
  isAnimating: boolean;
  animationClass: string;
  handleClick: <T extends Element>(
    e: React.MouseEvent<T>, 
    onClick?: (e: React.MouseEvent<T>) => void
  ) => void;
}

export const useButtonAnimation = (): UseButtonAnimationReturn => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = <T extends Element>(
    e: React.MouseEvent<T>,
    onClick?: (e: React.MouseEvent<T>) => void
  ) => {
    setIsAnimating(true);
    
    // Reset animation after it completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Match this with the CSS animation duration
    
    // Call the original onClick handler if provided
    if (onClick) {
      onClick(e);
    }
  };

  return {
    isAnimating,
    animationClass: isAnimating ? 'animate-button-click' : '',
    handleClick
  };
};
