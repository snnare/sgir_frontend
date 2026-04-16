import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material';
import { create } from 'zustand';

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
  showNotification: (message: string, severity?: AlertColor) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  open: false,
  message: '',
  severity: 'info',
  showNotification: (message, severity = 'info') => 
    set({ open: true, message, severity }),
  hideNotification: () => set({ open: false }),
}));

export const GlobalNotification = () => {
  const { open, message, severity, hideNotification } = useNotificationStore();

  return (
    <Snackbar 
      open={open} 
      autoHideDuration={6000} 
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={hideNotification} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
