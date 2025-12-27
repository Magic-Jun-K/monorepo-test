import { Button } from '../../components/ui/button';

export function ButtonExample() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">按钮组件</h2>
        <div className="flex flex-wrap gap-4">
          <Button>默认按钮</Button>
          <Button variant="destructive">危险按钮</Button>
          <Button variant="outline">轮廓按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="link">链接按钮</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">不同尺寸</h2>
        <div className="flex items-center gap-4">
          <Button size="sm">小按钮</Button>
          <Button size="default">默认按钮</Button>
          <Button size="lg">大按钮</Button>
          <Button size="icon">📦</Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">自定义业务组件</h2>
        <div className="p-6 bg-card rounded-lg border">
          <p className="text-muted-foreground mb-4">
            这里是你可以扩展自定义业务组件的地方。基于 shadcn 的设计系统，
            你可以创建符合业务需求的组件，同时保持一致的设计语言。
          </p>
          <div className="flex gap-4">
            <Button>主要操作</Button>
            <Button variant="outline">次要操作</Button>
          </div>
        </div>
      </section>
    </div>
  );
}