import { Input } from '../../components/enhanced/Input';
import { Search, User, Lock, Mail } from 'lucide-react';

export function EnhancedInputExample() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Ant Design 风格 Input 组件示例</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">基础用法</h3>
        <Input placeholder="基础输入框" />
        <Input placeholder="禁用状态" disabled />
        <Input placeholder="只读状态" readOnly />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">三种尺寸</h3>
        <div className="space-y-2">
          <Input size="sm" placeholder="小尺寸" />
          <Input size="md" placeholder="默认尺寸" />
          <Input size="lg" placeholder="大尺寸" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">三种变体</h3>
        <Input variant="outlined" placeholder="带边框 (默认)" />
        <Input variant="filled" placeholder="填充背景" />
        <Input variant="borderless" placeholder="无边框" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">状态</h3>
        <Input status="error" placeholder="错误状态" />
        <Input status="warning" placeholder="警告状态" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">前缀和后缀</h3>
        <Input prefix={<User className="h-4 w-4" />} placeholder="用户名" />
        <Input suffix=".com" placeholder="网站" />
        <Input 
          prefix={<Search className="h-4 w-4" />} 
          suffix={<span className="text-gray-500">搜索</span>} 
          placeholder="搜索框" 
        />
        <Input 
          prefix={<Lock className="h-4 w-4" />} 
          placeholder="密码" 
          type="password" 
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">清除图标</h3>
        <Input allowClear placeholder="输入内容后显示清除图标" />
        <Input allowClear prefix={<Mail className="h-4 w-4" />} placeholder="带前缀和清除图标" />
        <Input allowClear suffix=".com" placeholder="带后缀和清除图标" />
      </div>
    </div>
  );
}