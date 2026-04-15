import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F172A', // Azul muy oscuro (Navy/Slate) - Toque empresarial
      light: '#334155',
      dark: '#000000',
    },
    secondary: {
      main: '#3B82F6', // Azul brillante para acentos (botones secundarios, links)
    },
    background: {
      default: '#F8FAFC', // Fondo grisáceo muy tenue (estilo académico limpio)
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 }, // Quitar mayúsculas forzadas
  },
  shape: {
    borderRadius: 8, // Bordes ligeramente redondeados, más modernos
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none', // Estilo flat/minimalista
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid #E2E8F0', // Bordes definidos en lugar de sombras pesadas
          boxShadow: '0px 1px 3px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: 'none',
        },
      },
    },
  },
});