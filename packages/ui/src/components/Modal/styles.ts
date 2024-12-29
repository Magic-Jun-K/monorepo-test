import { HTMLAttributes, ButtonHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';

export const ModalOverlay = styled.div<HTMLAttributes<HTMLDivElement>>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  padding: 16px;
`;

export const ModalContent = styled.div<HTMLAttributes<HTMLDivElement> & { width?: number | string }>`
  position: relative;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  width: ${({ width }) => (typeof width === 'number' ? `${width}px` : width || '520px')};
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
`;

export const ModalHeader = styled.div<HTMLAttributes<HTMLDivElement>>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  color: rgba(0, 0, 0, 0.85);
  font-weight: 700;
  font-size: 16px;
  line-height: 22px;
  word-wrap: break-word;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
`;

export const ModalBody = styled.div<HTMLAttributes<HTMLDivElement>>`
  padding: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  overflow-y: auto;
  flex: 1;
  min-height: 0;

  img {
    max-width: 100%;
    height: auto;
  }

  input,
  textarea {
    max-width: 100%;
    box-sizing: border-box;
  }
`;

export const ModalFooter = styled.div<HTMLAttributes<HTMLDivElement>>`
  padding: 10px 16px;
  text-align: right;
  background: transparent;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;

  button + button {
    margin-left: 8px;
  }
`;

const buttonBase = css`
  outline: none;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  white-space: nowrap;
  text-align: center;
  background-image: none;
  background-color: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  user-select: none;
  touch-action: manipulation;
  font-size: 14px;
  border-radius: 6px;
  height: 32px;
  padding: 4px 15px;

  &:hover {
    opacity: 0.85;
  }

  &:active {
    opacity: 0.7;
  }
`;

export const CancelButton = styled.button`
  ${buttonBase}
  color: rgba(0, 0, 0, 0.85);
  background-color: #fff;
  border-color: #d9d9d9;

  &:hover {
    color: #40a9ff;
    border-color: #40a9ff;
  }

  &:active {
    color: #096dd9;
    border-color: #096dd9;
  }
`;

export const ConfirmButton = styled.button`
  ${buttonBase}
  color: #fff;
  background-color: #1890ff;
  border-color: #1890ff;
  text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.12);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);

  &:hover {
    background-color: #40a9ff;
    border-color: #40a9ff;
  }

  &:active {
    background-color: #096dd9;
    border-color: #096dd9;
  }
`;

export const CloseButton = styled.button<ButtonHTMLAttributes<HTMLButtonElement>>`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  z-index: 10;
  padding: 0;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.45);
  text-decoration: none;
  transition: color 0.2s, background-color 0.2s;

  &:hover {
    color: rgba(0, 0, 0, 0.75);
    background-color: rgba(0, 0, 0, 0.03);
  }

  &:active {
    color: rgba(0, 0, 0, 0.85);
    background-color: rgba(0, 0, 0, 0.06);
  }
`;
