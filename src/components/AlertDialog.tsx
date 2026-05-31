import { 
  Dialog, DialogTitle, DialogContent, DialogContentText, 
  DialogActions, Button, Typography 
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAlertStore } from '../store/useAlertStore';

export const AlertDialog = () => {
  const { 
    open, title, description, severity, buttonLabel, closeAlert 
  } = useAlertStore();

  const getIcon = () => {
    switch (severity) {
      case 'error': 
        return <ErrorIcon color="error" sx={{ fontSize: 44 }} />;
      case 'success': 
        return <CheckCircleIcon color="success" sx={{ fontSize: 44 }} />;
      case 'info': 
        return <InfoIcon color="info" sx={{ fontSize: 44 }} />;
      case 'warning':
      default: 
        return <ReportProblemIcon color="warning" sx={{ fontSize: 44 }} />;
    }
  };

  const getButtonColor = () => {
    switch (severity) {
      case 'error': return 'error';
      case 'success': return 'success';
      case 'info': return 'info';
      case 'warning':
      default: 
        return 'primary';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={closeAlert}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1.5,
            maxWidth: 400,
            animation: 'fadeIn 0.2s ease-in-out'
          }
        }
      }}
    >
      <DialogTitle component="div" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, pt: 3 }}>
        {getIcon()}
        <Typography component="div" variant="h5" sx={{ fontWeight: 800, textAlign: 'center', letterSpacing: '-0.02em', mt: 1 }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ textAlign: 'center', fontWeight: 500, color: 'text.secondary' }}>
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Button 
          fullWidth
          onClick={closeAlert} 
          variant="contained" 
          color={getButtonColor()}
          autoFocus
          sx={{ 
            borderRadius: 2.5, 
            py: 1.2,
            fontWeight: 700, 
            textTransform: 'none',
            boxShadow: 'none',
            bgcolor: severity === 'warning' ? 'text.primary' : undefined,
            color: severity === 'warning' ? 'background.paper' : undefined,
            '&:hover': { 
              boxShadow: 'none',
              bgcolor: severity === 'warning' ? 'grey.800' : undefined 
            }
          }}
        >
          {buttonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
