import React from 'react';
import { StyledButton } from './styles';
import { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({ variant = 'default', children, disabled }) => {
  return (
    <StyledButton disabled={disabled} variant={variant}>
      {children}
    </StyledButton>
  );
};
