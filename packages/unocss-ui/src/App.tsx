// import { Button } from './components/Button';
import { AutoComplete } from './components/AutoComplete';
import { Menu } from './components/Menu';
import { Dropdown } from './components/Dropdown';
import type { MenuType } from './components/Menu/types';
// import './utils/myCall';
// import './utils/myApply';
// import './utils/myBind';

import './App.css';

// antd 5.25.0 风格 menuConfig
const menuConfig: MenuType[] = [
  {
    key: 'dashboard',
    label: '仪表盘'
  },
  {
    key: 'settings',
    label: '系统设置',
    children: [
      {
        key: 'account',
        label: '账户管理'
      },
      {
        key: 'security',
        label: '安全设置',
        children: [
          {
            key: 'password',
            label: '密码修改'
          }
        ]
      },
      {
        type: 'group',
        key: 'help',
        label: '帮助中心',
        children: [
          {
            key: 'help-docs',
            label: '文档中心'
          }
        ]
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
      {/* <Menu mode="vertical" items={menuConfig} style={{ width: 256 }} />
      <div className="bg-pink-300">
        <Menu
          mode="horizontal"
          items={menuConfig}
          onClick={({ key, keyPath, item, domEvent }) => {
            console.log(key, keyPath, item, domEvent);
          }}
        />
      </div> */}
    </div>
  );
}
export default App;
