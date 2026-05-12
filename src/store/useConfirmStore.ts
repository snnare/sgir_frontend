import { create } from 'zustand';

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'error' | 'warning' | 'info';
  confirmAction: (options: {
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    confirmLabel?: string;
    cancelLabel?: string;
    severity?: 'error' | 'warning' | 'info';
  }) => void;
  closeConfirm: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  open: false,
  title: '',
  description: '',
  onConfirm: () => {},
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  severity: 'warning',
  confirmAction: (options) => set({ open: true, ...options }),
  closeConfirm: () => set({ open: false }),
}));
