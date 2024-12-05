// 所有组件的样式规则全部在这里
import { css, styled } from 'styled-components';
import type { ButtonVariant } from './types';
import { darken, lighten } from '../../core/utils';
import { VariantColorResolverResult } from '../../core';

// interface VariantColorResolveResult {
//     background: string
//     color: string
//     border: string
//     hover?: string
// }

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
    background: 'var(--common-primary-color-6)',
    hover: darken('var(--common-primary-color-6)', 0.01),
    border: `1px solid var(--common-primary-color-6)`
  },
  light: {
    color: '#383838',
    background: '#f8f9fa',
    hover: darken('#f8f9fa', 0.01),
    border: '1px solid #e9ecef'
  },
  outline: {
    color: 'var(--common-primary-color-6)',
    background: 'transparent',
    hover: lighten('#f5f5f5', 0.01),
    border: `1px solid var(--common-primary-color-6)`
  },
  transparent: {
    color: 'var(--common-primary-color-6)',
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
    background: `linear-gradient(45deg, var(--common-primary-color-6), ${lighten('var(--common-primary-color-6)', 0.4)})`,
    hover: `linear-gradient(45deg, var(--common-primary-color-6), ${lighten('var(--common-primary-color-6)', 0.4)})`,
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
export const StyledButton = styled.button<{ variant?: ButtonVariant }>`
  ${ButtonVarsCss}

  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s, background-color 0.15s, border-color 0.15s;
  cursor: pointer;

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

  &.btn-block {
    display: block;
    width: 100%;
  }

  &:not(:disabled):hover {
    background: ${props => getVariantColor(props.variant).hover};
  }
`;
