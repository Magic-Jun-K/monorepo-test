import { Link } from 'react-router-dom';
import type { MenuItemType } from '@eggshell/unocss-ui';

export const MENU_CONFIG: MenuItemType[] = [
  {
    itemKey: '/',
    label: '首页'
  },
  {
    itemKey: '/form-test',
    label: '表单测试页'
  },
  {
    itemKey: '/table-test',
    label: '表格测试页'
  },
  {
    itemKey: '/baidu-map',
    label: '百度地图'
  }
];
export const TEST_MENU_CONFIG: MenuItemType[] = [
  {
    itemKey: '/',
    label: <Link to="/">首页</Link> as React.ReactNode
  },
  {
    itemKey: '/form-test',
    label: <Link to="/form-test">表单测试页</Link>
  },
  {
    itemKey: '/table-test',
    label: <Link to="/table-test">表格测试页</Link>
  },
  {
    itemKey: '/baidu-map',
    label: <Link to="/baidu-map">百度地图</Link>
  },
  {
    itemKey: 'dashboard',
    label: '仪表盘'
  },
  {
    itemKey: 'settings',
    label: '系统设置',
    children: [
      {
        itemKey: 'account',
        label: '账户管理'
      },
      {
        itemKey: 'security',
        label: '安全设置',
        children: [
          {
            itemKey: 'password',
            label: '密码修改'
          }
        ]
      },
      {
        type: 'group',
        itemKey: 'help',
        label: '帮助中心',
        children: [
          {
            itemKey: 'help-docs',
            label: '文档中心'
          }
        ]
      }
    ]
  }
];
