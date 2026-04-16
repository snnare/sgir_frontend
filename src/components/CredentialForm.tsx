import { useState } from 'react';
import { 
  Box, TextField, Button, Stack, MenuItem, 
  InputAdornment, IconButton 
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import DnsIcon from '@mui/icons-material/Dns'; // Icono técnico para el test

export const CredentialForm = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <Box component="form" noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        
        {/* Tipo de Acceso */}
        <TextField
          select
          fullWidth
          id="id_tipo_acceso"
          label="Tipo de Acceso"
          defaultValue=""
          name="id_tipo_acceso"
          required
        >
          <MenuItem value={1}>SSH</MenuItem>
          <MenuItem value={2}>DB Native</MenuItem>
          <MenuItem value={3}>SFTP</MenuItem>
          <MenuItem value={4}>API</MenuItem>
        </TextField>

        {/* Usuario */}
        <TextField
          required
          fullWidth
          id="usuario"
          label="Nombre de Usuario / Identificador"
          name="usuario"
          autoComplete="username"
        />

        {/* Password con Toggle de Visibilidad */}
        <TextField
          required
          fullWidth
          id="password"
          label="Contraseña / Token / Secret Key"
          type={showPassword ? 'text' : 'password'}
          name="password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                  size="small"
                >
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Estado de Credencial */}
        <TextField
          select
          fullWidth
          id="estado_credencial"
          label="Estado de la Credencial"
          defaultValue="activo"
          name="estado_credencial"
        >
          <MenuItem value="activo">Activo</MenuItem>
          <MenuItem value="inactivo">Inactivo</MenuItem>
        </TextField>

        {/* Fila de Botones de Acción con margen superior */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          {/* Botón de Test (Secundario/Utilidad) */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<DnsIcon fontSize="small" />}
            sx={{ 
              py: 1.5, 
              fontWeight: 600,
              fontSize: '0.9rem',
              borderStyle: 'dashed', // Estilo técnico dashed
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover'
              }
            }}
          >
            Test Conexión
          </Button>

          {/* Botón de Guardar (Acción Principal) */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            startIcon={<KeyIcon />}
            sx={{ 
              py: 1.5, 
              fontWeight: 700,
              fontSize: '0.9rem',
              bgcolor: 'text.primary',
              color: 'background.paper'
            }}
          >
            Guardar
          </Button>
        </Stack>

      </Stack>
    </Box>
  );
};