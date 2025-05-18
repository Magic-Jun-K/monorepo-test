import { FC } from 'react';

import { Button } from '../Button';
import type { DrawerProps } from './types';

const placementStyle = {
  left: 'left-0 top-0 h-full w-[var(--drawer-size)]',
  right: 'right-0 top-0 h-full w-[var(--drawer-size)]',
  top: 'top-0 left-0 w-full h-[var(--drawer-size)]',
  bottom: 'bottom-0 left-0 w-full h-[var(--drawer-size)]'
};

export const Drawer: FC<DrawerProps> = ({
  open,
  onClose,
  title,
  placement = 'right',
  width = 378,
  height = 256,
  children,
  maskClosable = true,
  showClose = true,
  className = '',
  showFooter = false,
  footer,
  onOk,
  onCancel
}) => {
  const isHorizontal = placement === 'left' || placement === 'right';
  const sizeVar = isHorizontal
    ? { '--drawer-size': typeof width === 'number' ? `${width}px` : width }
    : { '--drawer-size': typeof height === 'number' ? `${height}px` : height };

  return (
    <>
      {/* 遮罩层 */}
      <div
        className={`fixed inset-0 z-49 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={maskClosable ? onClose : undefined}
        aria-hidden="true"
      />
      {/* 抽屉主体 */}
      <div
        className={`fixed z-50 bg-white shadow-lg transition-transform duration-300 ${
          placementStyle[placement]
        } ${
          open
            ? 'translate-x-0 translate-y-0'
            : placement === 'left'
            ? '-translate-x-full'
            : placement === 'right'
            ? 'translate-x-full'
            : placement === 'top'
            ? '-translate-y-full'
            : 'translate-y-full'
        } ${className}`}
        style={{ ...sizeVar, display: 'flex', flexDirection: isHorizontal ? 'column' : 'row' }} // 使抽屉主体为flex布局
        role="dialog"
        aria-modal="true"
      >
        {/* 头部 */}
        {(title || showClose) && (
          <div className="flex items-center justify-start px-4 py-3 border-b border-gray-200 shrink-0">
            {showClose && (
              <button
                className="i-carbon-arrow-left mr-2 text-lg text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                aria-label="关闭"
                onClick={onClose}
                type="button"
              ></button>
            )}
            <div className="text-base font-medium">{title}</div>
          </div>
        )}
        {/* 内容区+footer整体flex布局 */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-4 overflow-auto flex-1 min-h-0">{children}</div>
          {showFooter && (
            <div className="drawer-footer flex justify-end p-4 border-t border-gray-200 shrink-0 bg-white">
              {footer ? (
                footer
              ) : (
                <>
                  <Button onClick={onCancel} className="mr-2">
                    取消
                  </Button>
                  <Button type="primary" onClick={onOk}>
                    确定
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default Drawer;
