import { FC, ReactNode } from 'react';

interface LayoutBodyProps {
  children: ReactNode;
}

const LayoutBody: FC<LayoutBodyProps> = ({ children }) => {
  return <div className={'flex-1 box-border overflow-y-auto overflow-x-hidden relative'}>{children}</div>;
};
export default LayoutBody;