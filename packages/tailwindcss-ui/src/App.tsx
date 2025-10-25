import { ButtonExample, NavigationMenuExample, DialogExample } from './components/example/ui';
import { EnhancedButtonExample, EnhancedInputExample, EnhancedDialogExample, EnhancedSwiperExample } from './components/example/enhanced';

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          TailwindCSS UI 组件库
        </h1>
        
        <div className="space-y-8">
          {/* Button 按钮示例 */}
          <ButtonExample />
          <EnhancedButtonExample />
          {/* NavigationMenu 导航菜单示例 */}
          <NavigationMenuExample />
          {/* Input 输入框示例 */}
          <EnhancedInputExample />
          {/* Dialog 弹窗示例 */}
          <DialogExample />
          <EnhancedDialogExample />
          {/* Swiper 轮播图示例 */}
          <EnhancedSwiperExample />
        </div>
      </div>
    </div>
  );
}
export default App;