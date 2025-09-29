import styled, { css } from 'styled-components';
import { InputSize } from './types';

interface InputWrapperProps {
  size: InputSize;
  error?: boolean;
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
}

interface StyledInputProps {
  size: InputSize;
  error?: boolean;
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
}

const getSizeStyles = (size: InputSize) => {
  const sizes = {
    xs: {
      height: '24px',
      fontSize: '12px',
      padding: '0 8px',
    },
    sm: {
      height: '32px',
      fontSize: '14px',
      padding: '0 12px',
    },
    md: {
      height: '40px',
      fontSize: '14px',
      padding: '0 16px',
    },
    lg: {
      height: '48px',
      fontSize: '16px',
      padding: '0 20px',
    },
  };

  return sizes[size];
};

export const InputWrapper = styled.div<InputWrapperProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  border: 1px solid ${({ error }) => (error ? '#ff4d4f' : '#d9d9d9')};
  border-radius: 4px;
  transition: all 0.2s;
  background-color: #fff;

  ${({ size }) => {
    const { height } = getSizeStyles(size);
    return css`
      height: ${height};
    `;
  }}

  &:hover {
    border-color: ${({ error }) => (error ? '#ff4d4f' : '#40a9ff')};
  }

  &:focus-within {
    border-color: ${({ error }) => (error ? '#ff4d4f' : '#40a9ff')};
    box-shadow: ${({ error }) =>
      error
        ? '0 0 0 2px rgba(255, 77, 79, 0.2)'
        : '0 0 0 2px rgba(24, 144, 255, 0.2)'};
  }

  .input-icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    
    &.left {
      left: 12px;
    }
    
    &.right {
      right: 12px;
    }
  }
`;

export const StyledInput = styled.input<StyledInputProps>`
  width: 100%;
  border: none;
  outline: none;
  background: none;
  color: #333;

  ${({ size }) => {
    const { fontSize, padding } = getSizeStyles(size);
    return css`
      font-size: ${fontSize};
      padding: ${padding};
    `;
  }}

  ${({ hasLeftIcon }) =>
    hasLeftIcon &&
    css`
      padding-left: 36px;
    `}

  ${({ hasRightIcon }) =>
    hasRightIcon &&
    css`
      padding-right: 36px;
    `}

  &::placeholder {
    color: #999;
  }

  &:disabled {
    cursor: not-allowed;
    background-color: #f5f5f5;
  }
`;

export const ErrorMessage = styled.div`
  margin-top: 4px;
  color: #ff4d4f;
  font-size: 12px;
  line-height: 1.5;
`;
