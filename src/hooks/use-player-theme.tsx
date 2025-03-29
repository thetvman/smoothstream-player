
import { useEffect } from 'react';
import { usePlayerTheme } from '@/lib/playerThemeStore';

export function useApplyPlayerTheme() {
  const { theme } = usePlayerTheme();
  
  useEffect(() => {
    // Apply CSS variables for theming
    document.documentElement.style.setProperty('--player-theme-bg', theme.background);
    document.documentElement.style.setProperty('--player-theme-fg', theme.foreground);
    document.documentElement.style.setProperty('--player-theme-accent', theme.accent);
    document.documentElement.style.setProperty('--player-theme-control-bg', theme.controlBackground);
    document.documentElement.style.setProperty('--player-theme-control-fg', theme.controlForeground);
    
    // Size classes will be applied directly to components
    
    return () => {
      // Clean up custom properties on unmount
      document.documentElement.style.removeProperty('--player-theme-bg');
      document.documentElement.style.removeProperty('--player-theme-fg');
      document.documentElement.style.removeProperty('--player-theme-accent');
      document.documentElement.style.removeProperty('--player-theme-control-bg');
      document.documentElement.style.removeProperty('--player-theme-control-fg');
    };
  }, [theme]);
  
  return theme;
}
