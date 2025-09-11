import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const isHorizontal = placement === 'left' || placement === 'right';
  const sizeVar = isHorizontal
    ? { '--drawer-size': typeof width === 'number' ? `${width}px` : width }
    : { '--drawer-size': typeof height === 'number' ? `${height}px` : height };

  // 创建和管理portal容器
  useEffect(() => {
    // 创建专用的portal容器
    const container = document.createElement('div');
    container.setAttribute('data-drawer-container', 'true');
    document.body.appendChild(container);
    setPortalContainer(container);
    
    return () => {
      // 清理时安全移除容器
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      setPortalContainer(null);
    };
  }, []);

  // 管理body滚动
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [open]);

  // 如果容器还没准备好，不渲染Portal
  if (!portalContainer) {
    return null;
  }

  const drawerContent = (
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
        style={{ ...sizeVar, display: 'flex', flexDirection: isHorizontal ? 'column' : 'row' }}
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

  return createPortal(drawerContent, portalContainer);
};
export default Drawer;
