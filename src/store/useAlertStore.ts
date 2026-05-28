import { create } from 'zustand';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'success';

interface AlertState {
  open: boolean;
  title: string;
  description: string;
  severity: AlertSeverity;
  buttonLabel: string;
  onCloseCallback?: () => void;
  showAlert: (options: {
    title: string;
    description: string;
    severity?: AlertSeverity;
    buttonLabel?: string;
    onClose?: () => void;
  }) => void;
  closeAlert: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  open: false,
  title: '',
  description: '',
  severity: 'warning',
  buttonLabel: 'Entendido',
  onCloseCallback: undefined,
  showAlert: ({ title, description, severity = 'warning', buttonLabel = 'Entendido', onClose }) => {
    set({
      open: true,
      title,
      description,
      severity,
      buttonLabel,
      onCloseCallback: onClose,
    });
  },
  closeAlert: () => {
    const { onCloseCallback } = get();
    set({ open: false });
    if (onCloseCallback) {
      onCloseCallback();
    }
  },
}));
