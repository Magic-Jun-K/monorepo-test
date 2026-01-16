import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

export function DialogExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Shadcn Dialog Examples</h1>
      <section>
        <h2 className="text-2xl font-semibold mb-4">基础对话框</h2>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">打开对话框</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>基础对话框</DialogTitle>
                <DialogDescription>
                  这是一个基础的shadcn对话框组件示例。
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>这是对话框的内容区域。</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">不同尺寸</h2>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">小尺寸对话框</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>小尺寸对话框</DialogTitle>
                <DialogDescription>
                  这是一个宽度较小的对话框。
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>通过设置max-w-md类来控制对话框宽度。</p>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">大尺寸对话框</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>大尺寸对话框</DialogTitle>
                <DialogDescription>
                  这是一个宽度较大的对话框。
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>通过设置max-w-3xl类来控制对话框宽度。</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">自定义内容</h2>
        <div className="flex flex-wrap gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">带表单的对话框</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>用户信息</DialogTitle>
                <DialogDescription>
                  请输入您的个人信息。
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    姓名
                  </label>
                  <input
                    id="name"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    邮箱
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="请输入邮箱"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">取消</Button>
                <Button>保存</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">确认对话框</h2>
        <div className="flex flex-wrap gap-4">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">删除项目</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认删除</DialogTitle>
                <DialogDescription>
                  此操作不可撤销。您确定要删除此项目吗？
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  取消
                </Button>
                <Button variant="destructive" onClick={() => setIsOpen(false)}>
                  删除
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">自定义业务组件</h2>
        <div className="p-6 bg-card rounded-lg border">
          <p className="text-muted-foreground mb-4">
            这里是你可以扩展自定义业务组件的地方。基于 shadcn 的设计系统，
            你可以创建符合业务需求的对话框组件，同时保持一致的设计语言。
          </p>
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button>业务对话框</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>业务对话框</DialogTitle>
                  <DialogDescription>
                    这是一个符合业务需求的自定义对话框。
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p>在这里添加符合你业务需求的内容。</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline">取消</Button>
                  <Button>确认</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </div>
  );
}