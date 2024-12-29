import React from 'react';
import { StyledInput, InputWrapper, ErrorMessage } from './styles';
import { InputProps } from './types';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      error,
      errorMessage,
      leftIcon,
      rightIcon,
      fullWidth,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div style={{ width: fullWidth ? '100%' : 'auto' }}>
        <InputWrapper
          size={size}
          error={error}
          className={className}
          hasLeftIcon={!!leftIcon}
          hasRightIcon={!!rightIcon}
        >
          {leftIcon && <span className="input-icon left">{leftIcon}</span>}
          <StyledInput
            ref={ref}
            size={size}
            error={error}
            {...props}
          />
          {rightIcon && <span className="input-icon right">{rightIcon}</span>}
        </InputWrapper>
        {error && errorMessage && (
          <ErrorMessage>{errorMessage}</ErrorMessage>
        )}
      </div>
    );
  }
);
