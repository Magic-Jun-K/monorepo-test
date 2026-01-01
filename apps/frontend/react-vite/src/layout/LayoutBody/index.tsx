import { FC, ReactNode } from 'react';
import { clsx } from 'clsx';

import styles from './index.module.scss';

interface LayoutBodyProps {
  children: ReactNode;
}

const LayoutBody: FC<LayoutBodyProps> = ({ children }) => {
  return <main className={clsx(styles.layoutBody)}>{children}</main>;
};
export default LayoutBody;
