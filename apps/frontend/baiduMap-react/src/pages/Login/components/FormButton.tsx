import { ReactNode } from 'react';
import styles from '../index.module.scss';

interface FormButtonProps {
  children: ReactNode;
  loading?: boolean;
}

export default function FormButton({ children, loading }: FormButtonProps) {
  return (
    <button 
      type="submit" 
      disabled={loading} 
      className={styles.submitButton}
    >
      {children}
    </button>
  );
}
