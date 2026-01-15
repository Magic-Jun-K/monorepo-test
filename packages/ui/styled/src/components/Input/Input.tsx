import { forwardRef } from 'react';
import { StyledInput, InputWrapper, ErrorMessage } from './styles';
import { InputProps } from './types';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', error, errorMessage, leftIcon, rightIcon, fullWidth, className, ...props }, ref) => {
    return (
      <div style={{ width: fullWidth ? '100%' : 'auto' }}>
        <InputWrapper size={size} {...(error !== undefined && { error })} className={className} hasLeftIcon={!!leftIcon} hasRightIcon={!!rightIcon}>
          {leftIcon && <span className="input-icon left">{leftIcon}</span>}
          <StyledInput ref={ref} size={size} {...(error !== undefined && { error })} {...props} />
          {rightIcon && <span className="input-icon right">{rightIcon}</span>}
        </InputWrapper>
        {error && errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </div>
    );
  }
);
