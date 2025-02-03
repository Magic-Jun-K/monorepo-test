// 所有组件的样式规则全部在这里
import { css, styled } from 'styled-components';
import type { ButtonSize, ButtonVariant } from './types';
import { darken, lighten } from '../../core/utils';
import { VariantColorResolverResult } from '../../core';

/**
 * 按钮的变体通过一组样式来定义
 * background
 * color
 * border
 * hover
 */
// 可以用以 map 来实现
const variantMap: Record<ButtonVariant, VariantColorResolverResult> = {
  default: {
    color: '#383838',
    background: '#f5f5f5',
    hover: darken('#f5f5f5', 0.01),
    border: '1px solid #e9e9e9'
  },
  filled: {
    color: '#fff',
    background: 'var(--eggshell-primary-color-6)',
    hover: darken('var(--eggshell-primary-color-6)', 0.01),
    border: `1px solid var(--eggshell-primary-color-6)`
  },
  light: {
    color: '#383838',
    background: '#f8f9fa',
    hover: darken('#f8f9fa', 0.01),
    border: '1px solid #e9ecef'
  },
  outline: {
    color: 'var(--eggshell-primary-color-6)',
    background: 'transparent',
    hover: lighten('#f5f5f5', 0.01),
    border: `1px solid var(--eggshell-primary-color-6)`
  },
  transparent: {
    color: 'var(--eggshell-primary-color-6)',
    background: 'transparent',
    hover: 'transparent',
    border: 'none'
  },
  white: {
    color: '#383838',
    background: '#fff',
    hover: darken('#fff', 0.01),
    border: '1px solid #e9ecef'
  },
  subtle: {
    color: '#383838',
    background: '#f5f5f5',
    hover: darken('#f5f5f5', 0.01),
    border: 'none'
  },
  gradient: {
    color: '#fff',
    background: `linear-gradient(45deg, var(--eggshell-primary-color-6), ${lighten('var(--eggshell-primary-color-6)', 0.4)})`,
    hover: `linear-gradient(45deg, var(--eggshell-primary-color-6), ${lighten('var(--eggshell-primary-color-6)', 0.4)})`,
    border: 'none'
  },
  primary: {
    color: '#fff',
    background: '#1677ff',
    hover: darken('#1677ff', 0.1),
    border: 'none'
  }
};

const getVariantColor = (variant: ButtonVariant = 'default') => {
  return variantMap[variant];
};

/**
 * 组件外层
 */
// 按钮自定义属性
const ButtonVarsCss = css`
  --button-height-xs: 30px;
  --button-height-sm: 32px;
  --button-height-md: 36px;
  --button-height-lg: 40px;
  --button-height-xl: 44px;
`;
export const StyledButton = styled.button<{ 
  variant?: ButtonVariant; 
  size?: ButtonSize;
  fullWidth?: boolean;
}>`
  ${ButtonVarsCss}

  display: ${props => props.fullWidth ? 'block' : 'inline-block'};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border-radius: 0.25rem;
  transition: color 0.15s, background-color 0.15s, border-color 0.15s;
  cursor: pointer;

  /* Size styles */
  ${props => {
    switch (props.size) {
      case 'xs':
        return css`
          height: var(--button-height-xs);
          padding: 0 14px;
          font-size: 12px;
        `;
      case 'sm':
        return css`
          height: var(--button-height-sm);
          padding: 0 18px;
          font-size: 14px;
        `;
      case 'lg':
        return css`
          height: var(--button-height-lg);
          padding: 0 26px;
          font-size: 16px;
        `;
      case 'xl':
        return css`
          height: var(--button-height-xl);
          padding: 0 32px;
          font-size: 18px;
        `;
      default:
        return css`
          height: var(--button-height-md);
          padding: 0 22px;
          font-size: 14px;
        `;
    }
  }}

  /* 变体样式处理 */
  color: ${({ variant }) => getVariantColor(variant).color};
  background: ${({ variant }) => getVariantColor(variant).background};
  border: ${({ variant }) => getVariantColor(variant).border};

  &:focus {
    outline: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  &:not(:disabled):hover {
    background: ${props => getVariantColor(props.variant).hover};
  }

  /* Icon styles */
  .button-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    &.left {
      margin-right: 8px;
    }
    
    &.right {
      margin-left: 8px;
    }
  }

  /* Loading spinner */
  .loading-spinner {
    margin-right: 8px;
  }
`;
