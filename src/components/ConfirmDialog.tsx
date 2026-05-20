import { 
  Dialog, DialogTitle, DialogContent, DialogContentText, 
  DialogActions, Button, Typography 
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { useConfirmStore } from '../store/useConfirmStore';
import { useState } from 'react';

export const ConfirmDialog = () => {
  const { 
    open, title, description, onConfirm, confirmLabel, 
    cancelLabel, severity, closeConfirm 
  } = useConfirmStore();

  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      closeConfirm();
    }
  };

  const getIcon = () => {
    switch (severity) {
      case 'error': return <ErrorIcon color="error" sx={{ fontSize: 40 }} />;
      case 'info': return <InfoIcon color="info" sx={{ fontSize: 40 }} />;
      default: return <ReportProblemIcon color="warning" sx={{ fontSize: 40 }} />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? undefined : closeConfirm}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: 1,
            maxWidth: 400
          }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, pt: 3 }}>
        {getIcon()}
        <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center' }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ textAlign: 'center', fontWeight: 500 }}>
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 3, px: 3 }}>
        <Button 
          fullWidth
          onClick={closeConfirm} 
          disabled={loading}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
        >
          {cancelLabel}
        </Button>
        <Button 
          fullWidth
          onClick={handleConfirm} 
          disabled={loading}
          variant="contained" 
          color={severity === 'error' ? 'error' : 'primary'}
          autoFocus
          sx={{ 
            borderRadius: 2, 
            fontWeight: 700, 
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' }
          }}
        >
          {loading ? 'Procesando...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
