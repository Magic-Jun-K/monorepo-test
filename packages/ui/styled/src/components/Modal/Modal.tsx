/// <reference lib="dom" />
import { FC, useEffect, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { ModalProps } from './types';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CloseButton,
  CancelButton,
  ConfirmButton,
} from './styles';

const DefaultFooter: FC<{ onClose: () => void }> = ({ onClose }) => (
  <>
    <CancelButton onClick={onClose}>
      取消
    </CancelButton>
    <ConfirmButton onClick={onClose}>
      确定
    </ConfirmButton>
  </>
);

export const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 520,
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const modalContent = (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent width={width}>
        <ModalHeader>
          {title}
          {showCloseButton && (
            <CloseButton onClick={onClose}>
              <svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 00203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" />
              </svg>
            </CloseButton>
          )}
        </ModalHeader>
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          {footer !== undefined ? footer : <DefaultFooter onClose={onClose} />}
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );

  return createPortal(modalContent, document.body);
};
