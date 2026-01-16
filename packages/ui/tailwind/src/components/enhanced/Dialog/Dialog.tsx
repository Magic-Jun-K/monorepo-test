import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/enhanced/Button';
import type { DialogProps } from './types';
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogTitle as ShadcnDialogTitle,
  DialogDescription as ShadcnDialogDescription,
  DialogClose as ShadcnDialogClose,
  DialogPortal as ShadcnDialogPortal,
  DialogOverlay as ShadcnDialogOverlay,
} from '@/components/ui/dialog';

export const Dialog = ({
  open,
  onOpenChange,
  centered,
  footer,
  okText = '确定',
  cancelText = '取消',
  okButtonProps,
  cancelButtonProps,
  onOk,
  onCancel,
  title,
  children,
  className,
  description,
  ...props
}: DialogProps) => {
  // 默认footer实现
  const renderDefaultFooter = () => (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      <Button variant="outlined" onClick={onCancel} {...cancelButtonProps}>
        {cancelText}
      </Button>
      <Button variant="filled" onClick={onOk} {...okButtonProps}>
        {okText}
      </Button>
    </div>
  );

  // 居中样式
  const centeredClasses = centered
    ? 'top-[50%] translate-y-[-50%] data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]'
    : 'top-[20%] data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]';

  // 处理可选属性
  const dialogProps = {
    ...(open !== undefined && { open }),
    ...(onOpenChange !== undefined && { onOpenChange }),
  };

  return (
    <ShadcnDialog {...dialogProps}>
      <ShadcnDialogPortal>
        <ShadcnDialogOverlay
          className={cn(
            'fixed inset-0 z-50 bg-black/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            className,
          )}
        />
        <ShadcnDialogContent
          className={cn(centeredClasses, className)}
          aria-describedby={description ? undefined : 'dialog-description'}
          {...props}
        >
          {title && (
            <ShadcnDialogTitle className="flex flex-col space-y-1.5 text-center sm:text-left text-lg font-semibold leading-none tracking-tight">
              {title}
            </ShadcnDialogTitle>
          )}
          {description && (
            <ShadcnDialogDescription id="dialog-description" className="hidden">
              {description}
            </ShadcnDialogDescription>
          )}
          <div className="py-4">{children}</div>
          {footer === null ? null : footer !== undefined ? (
            <div className="mt-6">{footer}</div>
          ) : (
            renderDefaultFooter()
          )}
          <ShadcnDialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4 cursor-pointer" />
            <span className="sr-only">Close</span>
          </ShadcnDialogClose>
        </ShadcnDialogContent>
      </ShadcnDialogPortal>
    </ShadcnDialog>
  );
};
