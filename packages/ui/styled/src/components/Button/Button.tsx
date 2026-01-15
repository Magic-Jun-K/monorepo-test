import { forwardRef, MouseEvent } from 'react';
import { StyledButton } from './styles';
import { ButtonProps } from './types';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', children, disabled, loading, fullWidth, leftIcon, rightIcon, onClick, ...props }, ref) => {
    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
      if (!loading && !disabled && onClick) {
        onClick(event);
      }
    };

    return (
      <StyledButton
        ref={ref}
        disabled={disabled || loading}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        onClick={handleClick}
        {...props}
      >
        {loading && <span className="loading-spinner" />}
        {leftIcon && <span className="button-icon left">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="button-icon right">{rightIcon}</span>}
      </StyledButton>
    );
  }
);
