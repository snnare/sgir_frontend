import { 
  Box, TextField, Button, Stack, MenuItem, InputAdornment 
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import StorageIcon from '@mui/icons-material/Storage';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import SaveIcon from '@mui/icons-material/Save';

const STORAGE_TYPES = [
  { id: 1, name: 'Disco Local' },
  { id: 2, name: 'S3 Cloud' },
  { id: 3, name: 'NFS/NAS' },
  { id: 4, name: 'SAN/Fibre Channel' },
  { id: 5, name: 'NFS' },
];

export const BackupPathForm = () => {
  return (
    <Box component="form" noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        
        <TextField
          required
          fullWidth
          id="descripcion"
          label="Descripción de la Ruta"
          placeholder="ej. Almacenamiento Local de Emergencia"
          name="descripcion"
          autoFocus
        />

        <TextField
          required
          fullWidth
          id="path"
          label="Path / URI de Destino"
          placeholder="ej. /mnt/backups/db o s3://my-bucket/backup"
          name="path"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FolderOpenIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Tipo de Almacenamiento */}
        <TextField
          select
          fullWidth
          id="id_tipo_almacenamiento"
          label="Tipo de Almacenamiento"
          defaultValue=""
          name="id_tipo_almacenamiento"
          required
        >
          {STORAGE_TYPES.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {type.id === 2 ? <CloudQueueIcon fontSize="inherit" /> : <StorageIcon fontSize="inherit" />}
                <span>{type.name}</span>
              </Stack>
            </MenuItem>
          ))}
        </TextField>

        {/* Estado */}
        <TextField
          select
          fullWidth
          id="estado"
          label="Estado de la Ruta"
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
          startIcon={<SaveIcon />}
          sx={{ 
            mt: 2, 
            py: 1.5, 
            fontWeight: 700,
            bgcolor: 'text.primary',
            color: 'background.paper'
          }}
        >
          Guardar Ruta de Respaldo
        </Button>
      </Stack>
    </Box>
  );
};