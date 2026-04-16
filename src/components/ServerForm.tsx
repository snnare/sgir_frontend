import { 
  Box, TextField, Button, Stack, MenuItem, 
  FormControlLabel, Switch, Typography, IconButton, Tooltip 
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
export const ServerForm = () => {
  return (
    <Box component="form" noValidate sx={{ width: '100%' }}>
      <Stack spacing={3}>
        
        {/* IP con Botón de Check */}
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            required
            fullWidth
            id="ip_servidor"
            label="Dirección IP del Servidor"
            placeholder="192.168.1.1"
            name="ip_servidor"
          />
          <Button 
            variant="outlined" 
            sx={{ height: 40, minWidth: 100, borderStyle: 'dashed' }}
            startIcon={<CheckCircleOutlinedIcon />}
          >
            Check
          </Button>
        </Stack>

        <TextField
          required
          fullWidth
          id="nombre_servidor"
          label="Nombre del Servidor"
          name="nombre_servidor"
        />

        {/* Legacy Switch con Info */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControlLabel
            control={<Switch color="primary" />}
            label="Servidor Legacy"
            sx={{ mr: 0 }}
          />
          <Tooltip title="Los servidores legacy utilizan protocolos de conexión antiguos (RHEL 4/5)">
            <IconButton size="small">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Nivel de Criticidad */}
        <TextField
          select
          fullWidth
          id="nivel_criticidad"
          label="Nivel de Criticidad"
          defaultValue="medio"
          name="nivel_criticidad"
        >
          <MenuItem value="bajo">Bajo</MenuItem>
          <MenuItem value="medio">Medio</MenuItem>
          <MenuItem value="alto">Alto</MenuItem>
        </TextField>

        <TextField
          fullWidth
          multiline
          rows={3}
          id="descripcion"
          label="Descripción del Activo"
          name="descripcion"
        />

        {/* Estado del Servidor */}
        <TextField
          select
          fullWidth
          id="estado"
          label="Estado Inicial"
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
          sx={{ 
            mt: 2, 
            py: 1.5, 
            fontWeight: 700,
            bgcolor: 'text.primary',
            color: 'background.paper'
          }}
        >
          Registrar Servidor
        </Button>
      </Stack>
    </Box>
  );
};