export type ToastVariant = 'success' | 'danger';

export interface ScreenProps {
  onNotify: (message: string, variant?: ToastVariant) => void;
}
