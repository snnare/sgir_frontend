import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import { useThemeStore } from './store/useThemeStore';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';


function App() {
  const mode = useThemeStore((state) => state.mode);
  
  // Generamos el tema basado en el modo del store
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;