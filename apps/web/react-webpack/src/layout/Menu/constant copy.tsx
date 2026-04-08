// import { Link } from 'react-router-dom';

// // 定义我们自己的菜单项类型，兼容 Ant Design 的 MenuItem 类型
// export interface MenuItemTypeWithComponent {
//   key?: string;
//   label: React.ReactNode;
//   icon?: React.ReactNode;
//   disabled?: boolean;
//   danger?: boolean;
//   title?: string;
//   component?: string; // 组件路径，相对于 pages 目录
//   requireAdmin?: boolean; // 是否需要管理员权限
//   children?: MenuItemTypeWithComponent[]; // 保持可选以兼容无子菜单的项
//   [key: string]: unknown; // 允许其他 Ant Design MenuItem 属性
// }

// // 基础菜单配置
// const BASE_MENU_CONFIG: MenuItemTypeWithComponent[] = [
//   {
//     key: 'home',
//     label: <Link to="/">首页</Link>,
//     component: 'Home'
//   },
//   {
//     key: 'test',
//     label: '测试',
//     children: [
//       {
//         key: 'image-test',
//         label: <Link to="/image-test">图片测试</Link>,
//         component: 'ImageTest'
//       },
//       {
//         key: 'form-test',
//         label: <Link to="/form-test">表单测试</Link>,
//         component: 'FormTest'
//       },
//       {
//         key: 'table-test',
//         label: <Link to="/table-test">表格测试</Link>,
//         component: 'TableTest'
//       },
//       {
//         key: 'virtual-list-test',
//         label: <Link to="/virtual-list-test">虚拟列表测试</Link>,
//         component: 'VirtualListTest'
//       },
//       {
//         key: 'baidu-map',
//         label: <Link to="/baidu-map">百度地图测试</Link>,
//         component: 'BMapGLCom'
//       },
//       {
//         key: 'tailwind-test',
//         label: <Link to="/tailwind-test">TailwindCSS测试</Link>,
//         component: 'TailwindTest'
//       },
//       {
//         key: 'handwriting-js-test',
//         label: <Link to="/handwriting-js-test">手写JS测试</Link>,
//         component: 'HandwritingJSTest'
//       }
//     ]
//   },
//   {
//     key: 'settings',
//     label: '系统设置',
//     requireAdmin: true, // 需要管理员权限
//     children: [
//       {
//         key: 'users-and-permissions',
//         label: '用户与权限',
//         children: [
//           {
//             key: 'user-management',
//             label: <Link to="/user-management">用户管理</Link>,
//             component: 'User',
//             requireAdmin: true
//           },
//           {
//             key: 'roles-and-permissions',
//             label: '角色与权限',
//             children: [
//               {
//                 key: 'roles',
//                 label: <Link to="/settings/roles">角色管理</Link>
//               },
//               {
//                 key: 'permissions',
//                 label: <Link to="/settings/permissions">权限分配</Link>
//               },
//               {
//                 key: 'audit',
//                 label: <Link to="/settings/audit">权限审计</Link>
//               }
//             ]
//           },
//           {
//             key: 'security',
//             label: '安全策略',
//             children: [
//               {
//                 key: 'login-limit',
//                 label: <Link to="/settings/login-limit">登录限制</Link>
//               }
//             ]
//           }
//         ]
//       },
//       {
//         key: 'monitoring-and-security',
//         label: '监控与安全',
//         children: [
//           {
//             key: 'monitoring',
//             label: '实时监控',
//             children: [
//               {
//                 key: 'system-monitoring',
//                 label: <Link to="/monitoring/system">系统资源监控</Link>
//               },
//               {
//                 key: 'performance-monitoring',
//                 label: <Link to="/monitoring/performance">服务健康状态</Link>
//               },
//               {
//                 key: 'user-behavior',
//                 label: <Link to="/monitoring/user-behavior">用户行为监控</Link>
//               }
//             ]
//           },
//           {
//             key: 'error-log',
//             label: '错误日志',
//             children: [
//               {
//                 key: 'system-error-log',
//                 label: <Link to="/error-log/classify">日志分类</Link>
//               },
//               {
//                 key: 'performance-error-log',
//                 label: <Link to="/error-log/search">日志搜索与分析</Link>
//               },
//               {
//                 key: 'alarm',
//                 label: <Link to="/error-log/alarm">自动告警</Link>
//               }
//             ]
//           }
//         ]
//       },
//       {
//         key: 'advanced-settings',
//         label: '高级设置',
//         children: [
//           {
//             key: 'custom-menu',
//             label: '自定义菜单',
//             children: [
//               {
//                 key: 'sort',
//                 label: <Link to="/custom-menu/sort">功能模块排序</Link>
//               },
//               {
//                 key: 'hide',
//                 label: <Link to="/custom-menu/hide">隐藏/禁用菜单项</Link>
//               }
//             ]
//           },
//           {
//             key: 'system-upgrade',
//             label: '系统升级',
//             children: [
//               {
//                 key: 'upgrade',
//                 label: <Link to="/system-upgrade">版本发布管理</Link>
//               }
//             ]
//           }
//         ]
//       }
//       // {
//       //   type: 'group',
//       //   key: 'help',
//       //   label: '帮助中心',
//       //   children: [
//       //     {
//       //       key: 'help-docs',
//       //       label: '文档中心'
//       //     }
//       //   ]
//       // }
//     ]
//   }
// ];

// /**
//  * 从菜单配置中提取路由路径和组件信息
//  * @param menuConfig 菜单配置
//  * @returns 路由配置数组
//  */
// export const extractRoutesFromMenu = (menuConfig: MenuItemTypeWithComponent[]): Array<{path: string; component: string}> => {
//   const routes: Array<{path: string; component: string}> = [];
  
//   const extractFromItems = (items: MenuItemTypeWithComponent[]) => {
//     items.forEach(item => {
//       // 如果有组件信息，提取路由
//       if (item.component && item.key) {
//         let path = '';
        
//         // 根据 key 推断路径
//         if (item.key === 'home') {
//           path = '/';
//         } else {
//           // 将 key 中的驼峰命名转换为 kebab-case
//           path = '/' + item.key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
//         }
        
//         routes.push({
//           path,
//           component: item.component
//         });
//       }
      
//       // 递归处理子菜单
//       if (item.children && item.children.length > 0) {
//         extractFromItems(item.children);
//       }
//     });
//   };
  
//   extractFromItems(menuConfig);
//   return routes;
// };

// /**
//  * 根据用户权限过滤菜单配置
//  * @param userType 用户类型 ('INTERNAL' | 'EXTERNAL' | 'SYSTEM' | 'admin' | 'user')
//  * @returns 过滤后的菜单配置
//  */
// export const getMenuConfig = (userType?: string): MenuItemTypeWithComponent[] => {
//   console.warn('getMenuConfig - 用户类型:', userType);
  
//   // 递归过滤菜单项
//   const filterMenuItems = (items: MenuItemTypeWithComponent[]): MenuItemTypeWithComponent[] => {
//     return items.filter(item => {
//       // 如果当前项需要管理员权限，且用户不是管理员，则过滤掉
//       if (item.requireAdmin && (!userType || userType === 'user' || userType === 'EXTERNAL')) {
//         return false;
//       }
      
//       // 递归处理子菜单
//       if (item.children && item.children.length > 0) {
//         item.children = filterMenuItems(item.children);
//       }
      
//       return true;
//     });
//   };

//   // 普通用户：过滤掉需要管理员权限的菜单
//   if (!userType || userType === 'user' || userType === 'EXTERNAL') {
//     const filtered = filterMenuItems(BASE_MENU_CONFIG);
//     console.warn('普通用户过滤后的菜单:', filtered);
//     return filtered;
//   }

//   // 管理员和超级管理员：可以看到所有菜单
//   return BASE_MENU_CONFIG;
// };

// /**
//  * 获取路由配置（基于菜单配置自动生成）
//  * @param userType 用户类型
//  * @returns 路由配置数组
//  */
// export const getRoutesFromMenu = (userType?: string) => {
//   // 获取过滤后的菜单配置
//   const menuConfig = getMenuConfig(userType);
//   // 从菜单配置中提取路由
//   const routes = extractRoutesFromMenu(menuConfig);
  
//   return routes;
// };

// // 默认导出所有菜单（向后兼容）
// export const MENU_CONFIG = BASE_MENU_CONFIG;
