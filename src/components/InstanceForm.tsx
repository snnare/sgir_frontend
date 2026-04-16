import {
  Box, TextField, Button, Stack, MenuItem,
  InputAdornment, IconButton, Tooltip
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import { useNavigate } from 'react-router-dom';



// Datos de ejemplo basados en tu tabla de base de datos
const DBMS_OPTIONS = [
  { id: 1, name: 'PostgreSQL', version: '16.0', desc: 'DB de la App' },
  { id: 2, name: 'MySQL', version: '5.7', desc: 'Legacy' },
  { id: 3, name: 'MySQL', version: '8.0', desc: 'Modern' },
  { id: 4, name: 'Oracle Database', version: '19c', desc: 'Enterprise' },
  { id: 5, name: 'MongoDB', version: '8.0', desc: 'NoSQL' },
  { id: 6, name: 'PostgreSQL', version: '16.2', desc: 'Primario' },
];

export const InstanceForm = () => {
  const navigate = useNavigate();


  return (
    <Box component="form" noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>

        {/* Fila DBMS + Botón Agregar */}
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            select
            fullWidth
            id="id_dbms"
            label="Motor de Base de Datos (DBMS)"
            defaultValue=""
            name="id_dbms"
            required
            helperText="Selecciona el motor y versión instalado"
          >
            {DBMS_OPTIONS.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name} {option.version} — {option.desc}
              </MenuItem>
            ))}
          </TextField>

          <Tooltip title="Registrar nuevo motor DBMS">
            <IconButton
              onClick={() => navigate('/add-dbms')} // <--- Añadir navegación
              sx={{
                mt: 1,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1
              }}
            >
              <AddBoxIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <TextField
          required
          fullWidth
          id="nombre_instancia"
          label="Nombre de la Instancia"
          placeholder="ej. bd_app_uaemex"
          name="nombre_instancia"
        />

        <TextField
          required
          fullWidth
          id="puerto"
          label="Puerto de Conexión"
          type="number"
          name="puerto"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SettingsInputComponentIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          fullWidth
          id="estado"
          label="Estado de la Instancia"
          defaultValue="activo"
          name="estado"
        >
          <MenuItem value="activo">Activo</MenuItem>
          <MenuItem value="inactivo">Inactivo</MenuItem>
        </TextField>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          startIcon={<StorageIcon />}
          sx={{
            mt: 2,
            py: 1.5,
            fontWeight: 700,
            bgcolor: 'text.primary',
            color: 'background.paper'
          }}
        >
          Guardar Instancia
        </Button>
      </Stack>
    </Box>
  );
};