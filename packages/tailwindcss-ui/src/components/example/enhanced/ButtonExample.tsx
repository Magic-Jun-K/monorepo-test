import { Button } from '../../enhanced/Button';

export function EnhancedButtonExample() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Ant Design 风格按钮 (Button)</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">不同类型</h3>
            <div className="flex flex-wrap gap-4">
              <Button type="primary">主要按钮</Button>
              <Button type="default">默认按钮</Button>
              <Button type="dashed">虚线按钮</Button>
              <Button type="text">文本按钮</Button>
              <Button type="link">链接按钮</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">不同尺寸</h3>
            <div className="flex items-center gap-4">
              <Button size="sm">小按钮</Button>
              <Button size="md">中按钮</Button>
              <Button size="lg">大按钮</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">不同颜色</h3>
            <div className="flex flex-wrap gap-4">
              <Button color="primary">主要</Button>
              <Button color="success">成功</Button>
              <Button color="warning">警告</Button>
              <Button color="danger">危险</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">不同变体</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="filled" color="primary">填充</Button>
              <Button variant="outlined" color="primary">轮廓</Button>
              <Button variant="text" color="primary">文本</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">加载状态</h3>
            <div className="flex flex-wrap gap-4">
              <Button loading>加载中</Button>
              <Button loading type="primary">主要加载</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">危险状态</h3>
            <div className="flex flex-wrap gap-4">
              <Button type="primary" danger>危险按钮</Button>
              <Button color="danger">危险颜色</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}