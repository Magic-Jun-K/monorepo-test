import { FC, ReactNode } from 'react';
import { clsx } from 'clsx';

import styles from './index.module.scss';

interface ContainerBodyProps {
  children: ReactNode;
}

const ContainerBody: FC<ContainerBodyProps> = ({ children }) => {
  return (
    <div className={clsx(styles.containerBody)}>
      <div className={clsx(styles['main-container'])}>{children}</div>
    </div>
  );
};
export default ContainerBody;
