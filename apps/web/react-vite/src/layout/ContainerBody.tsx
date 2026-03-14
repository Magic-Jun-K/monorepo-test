import { FC, ReactNode } from 'react';
import { clsx } from 'clsx';

interface ContainerBodyProps {
  children: ReactNode;
  className?: string;
}

const ContainerBody: FC<ContainerBodyProps> = ({ children, className }) => {
  return (
    <div className="w-full h-full relative p-4 bg-[rgb(238,238,238)] flex flex-col overflow-hidden">
      <div
        className={clsx(
          'flex-1 flex flex-col bg-white rounded-lg p-4 min-h-0 overflow-hidden',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
export default ContainerBody;