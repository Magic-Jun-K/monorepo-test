export interface ModalProps {
  visible: boolean;
  title?: string;
  onCancel: () => void;
  onOk?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
