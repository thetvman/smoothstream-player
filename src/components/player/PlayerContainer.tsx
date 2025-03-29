
import React from "react";
import { useApplyPlayerTheme } from "@/hooks/use-player-theme";

interface PlayerContainerProps {
  children: React.ReactNode;
  containerRef?: React.RefObject<HTMLDivElement>;
  onClick?: () => void;
}

const PlayerContainer: React.FC<PlayerContainerProps> = ({ 
  children, 
  containerRef,
  onClick
}) => {
  const playerTheme = useApplyPlayerTheme();
  
  const getBorderRadius = () => {
    switch (playerTheme.cornerRadius) {
      case 'small': return 'rounded-md';
      case 'medium': return 'rounded-lg';
      case 'large': return 'rounded-xl';
      default: return '';
    }
  };
  
  const getPlayerSizeClass = () => {
    switch (playerTheme.size) {
      case 'small': return 'max-w-3xl';
      case 'medium': return 'max-w-4xl';
      case 'large': return 'max-w-6xl';
      default: return 'max-w-4xl';
    }
  };
  
  return (
    <div className={`relative ${getPlayerSizeClass()} mx-auto`}>
      <div 
        className={`relative aspect-video ${getBorderRadius()} overflow-hidden`}
        style={{ 
          backgroundColor: 'var(--player-theme-bg, black)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' 
        }}
        ref={containerRef}
        onClick={onClick}
      >
        {children}
      </div>
    </div>
  );
};

export default PlayerContainer;
