import { ReactNode } from 'react';
import { Button } from '@eggshell/unocss-ui';

import styles from '../index.module.scss';

interface FormButtonProps {
  children: ReactNode;
  loading?: boolean;
}

export default function FormButton({ children, loading }: FormButtonProps) {
  return (
    <Button 
      htmlType="submit" 
      disabled={loading} 
      className={styles.submitButton}
    >
      {children}
    </Button>
  );
}
