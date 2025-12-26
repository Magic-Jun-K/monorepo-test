// import { FC, useEffect, useState } from 'react';
// import { Menu } from '@eggshell/unocss-ui';

// import { currentUser } from '@/services/auth';
// import { getMenuConfig } from './constant';

// interface LocalMenuItem {
//   path: string;
//   name: string;
//   children?: LocalMenuItem[];
// }

// interface MenuProps {
//   items: LocalMenuItem[];
// }

// const MainMenu: FC<MenuProps> = ({ items }) => {
//   console.log('items', items);

//   const [menuConfig, setMenuConfig] = useState(getMenuConfig());
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const response = await currentUser();
//         const user = response.data as any;
//         // 根据用户角色过滤菜单
//         const isAdmin =
//           user.roles &&
//           user.roles.some(
//             (role: any) =>
//               role.code === 'SUPER_ADMIN' || role.code === 'ADMIN' || role.code === 'USER_MANAGER'
//           );
//         const filteredConfig = getMenuConfig(isAdmin ? 'admin' : 'user');
//         setMenuConfig(filteredConfig);
//       } catch (error) {
//         console.error('Failed to fetch current user:', error);
//         // 获取用户信息失败，默认显示普通用户菜单
//         setMenuConfig(getMenuConfig('user'));
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCurrentUser();
//   }, []);

//   if (loading) {
//     return (
//       <nav>
//         <div style={{ padding: '0 24px', lineHeight: '64px' }}>加载中...</div>
//       </nav>
//     );
//   }

//   console.log('Rendering menu items:', menuConfig);

//   return (
//     <nav>
//       <Menu mode="horizontal" items={menuConfig} />
//     </nav>
//   );
// };
// export default MainMenu;