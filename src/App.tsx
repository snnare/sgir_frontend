import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
import { HomePage } from './pages/HomePage';

// Nota: En un futuro, aquí envolverás las rutas con tu Sidebar y Topbar (Layouts)
function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline aplica el fondo y resetea estilos globales de CSS */}
      <CssBaseline /> 
      
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </Box>
    </ThemeProvider>
  );
}

export default App;