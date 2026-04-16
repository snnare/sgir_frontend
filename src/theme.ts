import { createTheme, type PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light' 
      ? {
          // Paleta Light (la que ya teníamos)
          primary: { main: '#0F172A' },
          background: { default: '#F8FAFC', paper: '#FFFFFF' },
          text: { primary: '#1E293B', secondary: '#64748B' },
        }
      : {
          // Paleta Dark (Empresarial/SRE)
          primary: { main: '#3B82F6' },
          background: { default: '#0F172A', paper: '#1E293B' },
          text: { primary: '#F1F5F9', secondary: '#94A3B8' },
          divider: '#334155',
        }),
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Quita el gradiente gris que pone MUI en dark mode
          border: `1px solid ${mode === 'light' ? '#E2E8F0' : '#334155'}`,
        },
      },
    },
  },
});