import { Box, TextField, Button, Stack } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

export const DbmsForm = () => {
  return (
    <Box component="form" noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <TextField
          required
          fullWidth
          id="nombre_dbms"
          label="Nombre del Motor (DBMS)"
          placeholder="ej. PostgreSQL, MySQL, SQL Server"
          name="nombre_dbms"
          autoFocus
        />

        <TextField
          required
          fullWidth
          id="version"
          label="Versión"
          placeholder="ej. 16.2, 8.0.35, 19c"
          name="version"
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          id="descripcion"
          label="Descripción / Notas de Uso"
          placeholder="ej. Edición Enterprise para servidores productivos"
          name="descripcion"
        />

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
          Guardar Motor
        </Button>
      </Stack>
    </Box>
  );
};