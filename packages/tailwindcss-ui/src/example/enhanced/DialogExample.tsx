import { useState } from 'react';
import { Button } from '@/components/enhanced/Button';
import { Dialog } from '@/components/enhanced/Dialog';

export function EnhancedDialogExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCenteredOpen, setIsCenteredOpen] = useState(false);
  const [isCustomFooterOpen, setIsCustomFooterOpen] = useState(false);

  const handleOk = () => {
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Enhanced Dialog Examples</h2>
      
      {/* 基础示例 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Basic Dialog</h3>
        <Button onClick={() => setIsOpen(true)}>
          Open Basic Dialog
        </Button>
        
        <Dialog 
          open={isOpen} 
          onOpenChange={setIsOpen}
          title="Basic Dialog"
          description="This is a basic dialog with default footer buttons."
          onOk={handleOk} 
          onCancel={handleCancel}
        >
          <p>This is the content of the dialog.</p>
        </Dialog>
      </div>
      
      {/* 居中示例 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Centered Dialog</h3>
        <Button onClick={() => setIsCenteredOpen(true)}>
          Open Centered Dialog
        </Button>
        
        <Dialog 
          open={isCenteredOpen} 
          onOpenChange={setIsCenteredOpen}
          title="Centered Dialog"
          description="This dialog is centered vertically on the screen."
          centered
          onOk={() => setIsCenteredOpen(false)} 
          onCancel={() => setIsCenteredOpen(false)}
        >
          <p>This dialog is vertically centered.</p>
        </Dialog>
      </div>
      
      {/* 自定义footer示例 */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Custom Footer Dialog</h3>
        <Button onClick={() => setIsCustomFooterOpen(true)}>
          Open Custom Footer Dialog
        </Button>
        
        <Dialog 
          open={isCustomFooterOpen} 
          onOpenChange={setIsCustomFooterOpen}
          title="Custom Footer Dialog"
          description="This dialog has a custom footer with three buttons."
          footer={
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button variant="text" onClick={() => setIsCustomFooterOpen(false)}>
                Maybe Later
              </Button>
              <Button variant="outlined" onClick={() => setIsCustomFooterOpen(false)}>
                Not Now
              </Button>
              <Button variant="filled" onClick={() => setIsCustomFooterOpen(false)}>
                Confirm
              </Button>
            </div>
          }
        >
          <p>You can customize the footer content as needed.</p>
        </Dialog>
      </div>
    </div>
  );
}