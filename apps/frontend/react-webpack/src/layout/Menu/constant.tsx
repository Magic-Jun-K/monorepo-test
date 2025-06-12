import { Link } from 'react-router-dom';
import type { MenuItemType } from '@eggshell/unocss-ui';

export const MENU_CONFIG: MenuItemType[] = [
  {
    key: '/',
    label: <Link to="/">首页</Link>
  },
  {
    key: '/form-test',
    label: <Link to="/form-test">表单测试</Link>
  },
  {
    key: '/table-test',
    label: <Link to="/table-test">表格测试</Link>
  },
  {
    key: '/virtual-list-test',
    label: <Link to="/virtual-list-test">虚拟列表测试</Link>
  },
  {
    key: '/baidu-map',
    label: <Link to="/baidu-map">百度地图</Link>
  },
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
