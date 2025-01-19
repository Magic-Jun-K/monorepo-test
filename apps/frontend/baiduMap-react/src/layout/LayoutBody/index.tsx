import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { clsx } from 'clsx';

import styles from './index.module.scss';

interface LayoutBodyProps {
  children: ReactNode;
}

const LayoutBody: FC<LayoutBodyProps> = ({ children }) => {
  const location = useLocation();
  return <div className={clsx(styles.layoutBody, { [styles.isPadding]: location.pathname === '/home' })}>{children}</div>;
};

export default LayoutBody;
