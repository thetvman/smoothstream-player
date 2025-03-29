
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlayerTheme = {
  background: string;
  foreground: string;
  accent: string;
  controlBackground: string;
  controlForeground: string;
  size: 'small' | 'medium' | 'large';
  cornerRadius: 'none' | 'small' | 'medium' | 'large';
};

const defaultTheme: PlayerTheme = {
  background: 'hsl(var(--player-background))',
  foreground: 'hsl(var(--player-foreground))',
  accent: 'hsl(var(--primary))',
  controlBackground: 'hsl(var(--player-control))',
  controlForeground: 'hsl(var(--player-foreground))',
  size: 'medium',
  cornerRadius: 'medium',
};

interface PlayerThemeState {
  theme: PlayerTheme;
  setTheme: (theme: Partial<PlayerTheme>) => void;
  resetTheme: () => void;
}

export const usePlayerTheme = create<PlayerThemeState>()(
  persist(
    (set) => ({
      theme: defaultTheme,
      setTheme: (newTheme) => 
        set((state) => ({ theme: { ...state.theme, ...newTheme } })),
      resetTheme: () => set({ theme: defaultTheme }),
    }),
    {
      name: 'player-theme-storage',
    }
  )
);
