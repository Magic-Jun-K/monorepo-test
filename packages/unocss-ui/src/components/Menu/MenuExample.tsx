// import { Dropdown } from '../Dropdown';
// import { Menu } from './Menu';
// import { MenuItemType } from './types';

// // 在检查前定义 menuConfig
// const menuConfig: MenuItemType[] = [
//   {
//     type: 'item',
//     itemKey: 'dashboard',
//     label: '仪表盘'
//   },
//   {
//     type: 'submenu',
//     itemKey: 'settings',
//     label: '系统设置',
//     children: [
//       {
//         type: 'item',
//         itemKey: 'account',
//         label: '账户管理'
//       },
//       {
//         type: 'submenu',
//         itemKey: 'security',
//         label: '安全设置',
//         children: [
//           {
//             type: 'item',
//             itemKey: 'password',
//             label: '密码修改'
//           }
//         ]
//       }
//     ]
//   },
//   {
//     type: 'group',
//     itemKey: 'help',
//     label: '帮助中心',
//     children: [
//       {
//         type: 'item',
//         itemKey: 'help-docs',
//         label: '文档中心'
//       }
//     ]
//   }
// ];
// function Example() {
//   return (
//     <Dropdown overlay={<Menu mode="vertical" items={menuConfig} />}>
//       <div className="p-4 bg-gray-200 mt-8 ml-8">测试下拉菜单</div>
//     </Dropdown>
//   );
// }
// export default Example;
