import { Button as EButton } from '../../common/Button';

export function CommonButtonExample() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">Ant Design 风格按钮 (EButton)</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">不同类型</h3>
            <div className="flex flex-wrap gap-4">
              <EButton type="primary">主要按钮</EButton>
              <EButton type="default">默认按钮</EButton>
              <EButton type="dashed">虚线按钮</EButton>
              <EButton type="text">文本按钮</EButton>
              <EButton type="link">链接按钮</EButton>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">不同尺寸</h3>
            <div className="flex items-center gap-4">
              <EButton size="sm">小按钮</EButton>
              <EButton size="md">中按钮</EButton>
              <EButton size="lg">大按钮</EButton>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">不同颜色</h3>
            <div className="flex flex-wrap gap-4">
              <EButton color="primary">主要</EButton>
              <EButton color="success">成功</EButton>
              <EButton color="warning">警告</EButton>
              <EButton color="danger">危险</EButton>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">不同变体</h3>
            <div className="flex flex-wrap gap-4">
              <EButton variant="filled" color="primary">填充</EButton>
              <EButton variant="outlined" color="primary">轮廓</EButton>
              <EButton variant="text" color="primary">文本</EButton>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">加载状态</h3>
            <div className="flex flex-wrap gap-4">
              <EButton loading>加载中</EButton>
              <EButton loading type="primary">主要加载</EButton>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">危险状态</h3>
            <div className="flex flex-wrap gap-4">
              <EButton type="primary" danger>危险按钮</EButton>
              <EButton color="danger">危险颜色</EButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}