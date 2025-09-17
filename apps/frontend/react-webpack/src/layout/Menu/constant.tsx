import { Link } from 'react-router-dom';
import type { MenuItemType } from '@eggshell/unocss-ui';

// 基础菜单配置
const BASE_MENU_CONFIG: MenuItemType[] = [
  {
    key: 'home',
    label: <Link to="/">首页</Link>
  },
  {
    key: 'test',
    label: '测试',
    children: [
      {
        key: 'form-test',
        label: <Link to="/form-test">表单测试</Link>
      },
      {
        key: 'table-test',
        label: <Link to="/table-test">表格测试</Link>
      },
      {
        key: 'virtual-list-test',
        label: <Link to="/virtual-list-test">虚拟列表测试</Link>
      },
      {
        key: 'baidu-map',
        label: <Link to="/baidu-map">百度地图测试</Link>
      }
    ]
  },
  {
    key: 'settings',
    label: '系统设置',
    requireAdmin: true, // 需要管理员权限
    children: [
      {
        key: 'users-and-permissions',
        label: '用户与权限',
        children: [
          {
            key: 'user-management',
            label: <Link to="/user-management">用户管理</Link>
          },
          {
            key: 'roles-and-permissions',
            label: '角色与权限',
            children: [
              {
                key: 'roles',
                label: <Link to="/settings/roles">角色管理</Link>
              },
              {
                key: 'permissions',
                label: <Link to="/settings/permissions">权限分配</Link>
              },
              {
                key: 'audit',
                label: <Link to="/settings/audit">权限审计</Link>
              }
            ]
          },
          {
            key: 'security',
            label: '安全策略',
            children: [
              {
                key: 'login-limit',
                label: <Link to="/settings/login-limit">登录限制</Link>
              }
            ]
          }
        ]
      },
      {
        key: 'monitoring-and-security',
        label: '监控与安全',
        children: [
          {
            key: 'monitoring',
            label: '实时监控',
            children: [
              {
                key: 'system',
                label: <Link to="/monitoring/system">系统资源监控</Link>
              },
              {
                key: 'performance',
                label: <Link to="/monitoring/performance">服务健康状态</Link>
              },
              {
                key: 'user-behavior',
                label: <Link to="/monitoring/user-behavior">用户行为监控</Link>
              }
            ]
          },
          {
            key: 'error-log',
            label: '错误日志',
            children: [
              {
                key: 'system',
                label: <Link to="/error-log/classify">日志分类</Link>
              },
              {
                key: 'performance',
                label: <Link to="/error-log/search">日志搜索与分析</Link>
              },
              {
                key: 'alarm',
                label: <Link to="/error-log/alarm">自动告警</Link>
              }
            ]
          }
        ]
      },
      {
        key: '',
        label: '高级设置',
        children: [
          {
            key: 'custom-menu',
            label: '自定义菜单',
            children: [
              {
                key: 'sort',
                label: <Link to="/custom-menu/sort">功能模块排序</Link>
              },
              {
                key: 'hide',
                label: <Link to="/custom-menu/hide">隐藏/禁用菜单项</Link>
              }
            ]
          },
          {
            key: 'system-upgrade',
            label: '系统升级',
            children: [
              {
                key: 'upgrade',
                label: <Link to="/system-upgrade">版本发布管理</Link>
              }
            ]
          }
        ]
      }
      // {
      //   type: 'group',
      //   key: 'help',
      //   label: '帮助中心',
      //   children: [
      //     {
      //       key: 'help-docs',
      //       label: '文档中心'
      //     }
      //   ]
      // }
    ]
  }
];

/**
 * 根据用户权限过滤菜单配置
 * @param userType 用户类型 ('INTERNAL' | 'EXTERNAL' | 'SYSTEM' | 'admin' | 'user')
 * @returns 过滤后的菜单配置
 */
export const getMenuConfig = (userType?: string): MenuItemType[] => {
  // 普通用户：过滤掉需要管理员权限的菜单
  if (!userType || userType === 'user' || userType === 'EXTERNAL') {
    return BASE_MENU_CONFIG.filter(item => !item.requireAdmin);
  }

  // 管理员和超级管理员：可以看到所有菜单
  // INTERNAL 和 SYSTEM 类型用户，以及 admin 类型用户都可以看到管理员菜单
  return BASE_MENU_CONFIG;
};

// 默认导出所有菜单（向后兼容）
export const MENU_CONFIG = BASE_MENU_CONFIG;
