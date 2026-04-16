import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type PaletteMode } from '@mui/material';

interface ThemeState {
  mode: PaletteMode;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      toggleTheme: () => 
        set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'theme-storage' } // Se guarda en localStorage automáticamente
  )
);