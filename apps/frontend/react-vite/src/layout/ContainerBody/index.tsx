import { FC, ReactNode } from 'react';
import { clsx } from 'clsx';

import styles from './index.module.scss';

interface ContainerBodyProps {
  children: ReactNode;
  className?: string;
}

const ContainerBody: FC<ContainerBodyProps> = ({ children, className }) => {
  return (
    <div className={clsx(styles.containerBody)}>
      <div className={clsx(styles['main-container'], className)}>{children}</div>
    </div>
  );
};
export default ContainerBody;
