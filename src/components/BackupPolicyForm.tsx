import { 
  Box, TextField, Button, Stack, MenuItem, InputAdornment 
} from '@mui/material';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HistoryIcon from '@mui/icons-material/History';

const BACKUP_TYPES = [
  { id: 1, name: 'Completo' },
  { id: 2, name: 'Incremental' },
  { id: 3, name: 'Diferencial' },
  { id: 4, name: 'Full' },
];

export const BackupPolicyForm = () => {
  return (
    <Box component="form" noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        
        <TextField
          required
          fullWidth
          id="nombre_politica"
          label="Nombre de la Política"
          placeholder="ej. Diaria_Produccion_Standard"
          name="nombre_politica"
          autoFocus
        />

        <TextField
          fullWidth
          multiline
          rows={2}
          id="descripcion"
          label="Descripción"
          name="descripcion"
        />

        {/* Fila de Parámetros Numéricos */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            required
            fullWidth
            type="number"
            id="frecuencia_horas"
            label="Frecuencia"
            name="frecuencia_horas"
            InputProps={{
              endAdornment: <InputAdornment position="end">Horas</InputAdornment>,
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTimeIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            required
            fullWidth
            type="number"
            id="retencion_dias"
            label="Retención"
            name="retencion_dias"
            InputProps={{
              endAdornment: <InputAdornment position="end">Días</InputAdornment>,
              startAdornment: (
                <InputAdornment position="start">
                  <HistoryIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {/* Tipo de Respaldo */}
        <TextField
          select
          fullWidth
          id="id_tipo_respaldo"
          label="Tipo de Respaldo"
          defaultValue=""
          name="id_tipo_respaldo"
          required
        >
          {BACKUP_TYPES.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Estado */}
        <TextField
          select
          fullWidth
          id="estado"
          label="Estado de la Política"
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
          startIcon={<BackupTableIcon />}
          sx={{ 
            mt: 2, 
            py: 1.5, 
            fontWeight: 700,
            bgcolor: 'text.primary',
            color: 'background.paper'
          }}
        >
          Crear Política
        </Button>
      </Stack>
    </Box>
  );
};