// import { Button } from './components/Button';
import { AutoComplete } from './components/AutoComplete';
import { Menu } from './components/Menu';

import { Dropdown } from './components/Dropdown';
import type { MenuItemType } from './components/Menu/types';
// import './utils/myCall';
// import './utils/myApply';
// import './utils/myBind';

import './App.css';

// 在检查前定义 menuConfig
const menuConfig: MenuItemType[] = [
  {
    type: 'item',
    itemKey: 'dashboard',
    label: '仪表盘'
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
        filterOption={(input, option) =>
          typeof option.label === 'string' ? option.label.includes(input) : false
        }
        allowClear
        placeholder="请输入城市"
        style={{ width: '400px' }}
      />
      <Dropdown overlay={<Menu mode="vertical" items={menuConfig} />}>
        <div className="p-4 bg-gray-200 mt-8 ml-8">测试下拉菜单</div>
      </Dropdown>
    </div>
  );
}
export default App;
