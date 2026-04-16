import { createTheme, type PaletteMode } from '@mui/material';

export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light Mode: Papel limpio y texto negro profundo
          primary: { main: '#18181b' }, // Zinc 900
          background: { default: '#ffffff', paper: '#ffffff' },
          text: { primary: '#09090b', secondary: '#71717a' },
          divider: '#e4e4e7', // Zinc 200
        }
      : {
          // Dark Mode: Carbono y texto suave (No negro puro para evitar fatiga)
          primary: { main: '#fafafa' }, // Zinc 50
          background: { default: '#09090b', paper: '#09090b' },
          text: { primary: '#fafafa', secondary: '#a1a1aa' },
          divider: '#27272a', // Zinc 800
        }),
  },
  typography: {
    fontFamily: '"Inter", "system-ui", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.05em' },
    h5: { fontWeight: 600, letterSpacing: '-0.02em' },
    button: { 
      textTransform: 'none', 
      fontWeight: 500,
      letterSpacing: '0.01em' 
    },
  },
  shape: {
    borderRadius: 6, // Bordes un poco más cerrados y técnicos
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Suavizado de fuentes para ese look "premium"
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          // En lugar de sombras, usamos bordes sutiles
          border: `1px solid ${mode === 'light' ? '#e4e4e7' : '#27272a'}`,
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small', // Inputs más compactos y técnicos
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          ...(mode === 'dark' && {
            // Botón blanco en fondo negro para el dark mode
            backgroundColor: '#fafafa',
            color: '#09090b',
            '&:hover': {
              backgroundColor: '#e4e4e7',
            },
          }),
        },
      },
    },
  },
});