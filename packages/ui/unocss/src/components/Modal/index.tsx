import type { ModalProps, ConfirmModalProps } from './types';
import { Modal } from './Modal';

// 扩展Modal类型以包含静态方法
interface ModalWithConfirm {
  (props: ModalProps): JSX.Element;
  confirm: (props: ConfirmModalProps) => Promise<void>;
}

// Modal.tsx中已经实现了confirm静态方法，这里直接使用类型断言
// 重新导出带有正确类型的Modal
export const ModalWithStaticMethods: ModalWithConfirm = Modal as ModalWithConfirm;

// 导出类型
export type { ModalProps, ConfirmModalProps };
export { Modal };
