import { ReactNode, memo } from 'react';
import { Button } from '@eggshell/ui-tailwind';

import styles from '../index.module.scss';

interface FormButtonProps {
  children: ReactNode;
  loading?: boolean;
}

export default memo(function FormButton({ children, loading }: FormButtonProps) {
  return (
    <Button htmlType="submit" disabled={loading} className={styles.submitButton} type="primary">
      {children}
    </Button>
  );
});
