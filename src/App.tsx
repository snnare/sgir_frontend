import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme';
import { useThemeStore } from './store/useThemeStore';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { CheckPage } from './pages/CheckPage'

import { AddServerPage} from './pages/AddServerPage';
import {AddCredentialPage} from './pages/AddCredentialPage'
import {AddInstancePage} from './pages/AddInstancePage'

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
          <Route path="/ping" element={<CheckPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/add-server" element={<AddServerPage />} />
          <Route path='/add-credential' element={<AddCredentialPage />} />
          <Route path='/add-instance' element={<AddInstancePage />} />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;