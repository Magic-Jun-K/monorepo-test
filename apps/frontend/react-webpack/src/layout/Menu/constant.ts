import type { MenuItemType } from '@eggshell/unocss-ui';

export const MENU_CONFIG: MenuItemType[] = [
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
