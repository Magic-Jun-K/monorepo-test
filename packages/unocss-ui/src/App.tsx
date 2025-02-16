import { Button } from './components/Button';
import { Swiper } from './components/Swiper';
import { AutoComplete } from './components/AutoComplete';
import { Menu } from './components/Menu';
import { Dropdown } from './components/Dropdown';
import type { MenuItemType } from './components/Menu/types';

import '@unocss/reset/tailwind.css'; // 引入 CSS 重置
import 'virtual:uno.css'; // 引入 UnoCSS 生成的样式
import './App.css';

// 在检查前定义 menuConfig
const menuConfig: MenuItemType[] = [
  {
    type: 'item',
    itemKey: 'dashboard',
    label: '仪表盘',
  },
  {
    type: 'submenu',
    itemKey: 'settings',
    label: '系统设置',
    children: [
      {
        type: 'item',
        itemKey: 'account',
        label: '账户管理'
      },
      {
        type: 'submenu',
        itemKey: 'security',
        label: '安全设置',
        children: [
          {
            type: 'item',
            itemKey: 'password',
            label: '密码修改'
          }
        ]
      }
    ]
  },
  {
    type: 'group',
    itemKey: 'help',
    label: '帮助中心',
    children: [
      {
        type: 'item',
        itemKey: 'help-docs',
        label: '文档中心'
      }
    ]
  }
];

function App() {
  return (
    <div className="w-full h-full">
      <Button size="lg" className="test">测试</Button>
      <div className="w-250 h-120">
        <Swiper className="w-full h-full" loop autoPlay>
          <div className="w-full h-full bg-red-500">1</div>
          <div className="w-full h-full bg-pink-500">2</div>
          <div className="w-full h-full bg-blue-500">3</div>
        </Swiper>
      </div>
      <AutoComplete
        options={[
          { label: '北京', value: 'bj' },
          { label: '上海', value: 'sh' },
          { label: '广州', value: 'gz' },
          { label: '广州2', value: 'gz' },
          { label: '广州3', value: 'gz' },
          { label: '深圳', value: 'sz' },
          { label: '成都', value: 'cd' },
          { label: '重庆', value: 'cq' },
          { label: '西安', value: 'xa' },
          { label: '武汉', value: 'wh' }
        ]}
        filterOption={(input, option) => (typeof option.label === 'string' ? option.label.includes(input) : false)}
        allowClear
        placeholder="请输入城市"
        style={{ width: '400px' }}
      />
      <Dropdown
        overlay={
          <Menu
            mode="vertical"
            items={menuConfig}
          />
        }
      >
        <Button>测试下拉菜单</Button>
      </Dropdown>
    </div>
  );
}

// 添加开发环境下的 key 检查
if (import.meta.env.DEV) {
  const checkKeys = (items: MenuItemType[], parentKey = '') => {
    items.forEach((item, index) => {
      if (!item.itemKey) {
        console.error(`Missing itemKey for menu item: ${item.label}`, item);
      }
      if (item.children) {
        checkKeys(item.children, `${parentKey}-${item.itemKey || index}`);
      }
    });
  };
  checkKeys(menuConfig);
}

export default App;
