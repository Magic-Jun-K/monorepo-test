// import React, { useState, useMemo } from 'react';

// import type { MenuType, MenuProps } from '../types';
// import './menu.css';

// function getItemKey(item: MenuType): string {
//   return item.key || item.itemKey || '';
// }

// const findItemPath = (
//   items: MenuType[],
//   targetKey: string,
//   currentPath: string[] = []
// ): string[] | null => {
//   for (const item of items) {
//     const key = getItemKey(item);
//     const newPath = [...currentPath, key];
//     if (key === targetKey) {
//       return newPath;
//     }
//     if ('children' in item && Array.isArray(item.children)) {
//       const foundPath = findItemPath(item.children, targetKey, newPath);
//       if (foundPath) {
//         return foundPath;
//       }
//     }
//   }
//   return null;
// };

// const MenuItem: React.FC<{
//   item: MenuType;
//   mode: 'vertical' | 'horizontal';
//   selectedKey?: string;
//   onSelect?: (key: string) => void;
//   parentKeyPath?: string[];
//   selectedKeyPath?: string[];
//   onClick?: MenuProps['onClick'];
// }> = ({ mode, item, selectedKey, onSelect, parentKeyPath = [], selectedKeyPath = [], onClick }) => {
//   const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
//   const key = getItemKey(item);
//   // 判断当前项是否在选中路径上（祖先）
//   const isInSelectedPath = selectedKeyPath ? selectedKeyPath.includes(key) : false;
//   const handleMouseEnter = () => {
//     if ('children' in item && !('type' in item && item.type === 'group')) {
//       setIsSubmenuOpen(true);
//     }
//   };
//   const handleMouseLeave = () => {
//     if ('children' in item && !('type' in item && item.type === 'group')) {
//       setIsSubmenuOpen(false);
//     }
//   };
//   const handleClick = (e: React.MouseEvent) => {
//     if (!('children' in item) && !item.disabled) {
//       onSelect?.(key);
//       onClick?.({ key, keyPath: [...parentKeyPath, key], item, domEvent: e });
//     }
//   };
//   // 分组
//   if ('type' in item && item.type === 'group') {
//     return (
//       <li className="menu-group">
//         <div className="menu-group-title">{item.label}</div>
//         <ul className="menu-group-list">
//           {item.children?.map((child: MenuType) => (
//             <MenuItem
//               key={getItemKey(child)}
//               item={child}
//               mode={mode}
//               selectedKey={selectedKey}
//               onSelect={onSelect}
//               parentKeyPath={parentKeyPath}
//               selectedKeyPath={selectedKeyPath}
//               onClick={onClick}
//             />
//           ))}
//         </ul>
//       </li>
//     );
//   }
//   // 子菜单
//   if ('children' in item && Array.isArray(item.children)) {
//     return (
//       <li
//         className={`menu-item submenu ${isSubmenuOpen ? 'submenu-open' : ''}`}
//         onMouseEnter={handleMouseEnter}
//         onMouseLeave={handleMouseLeave}
//       >
//         <div
//           className={`submenu-title w-full ${
//             isInSelectedPath && selectedKey !== key ? 'menu-ancestor-selected' : ''
//           }`}
//         >
//           {item.icon && <span className="menu-item-icon mr-2">{item.icon}</span>}
//           <span className="menu-item-label">{item.label}</span>
//           <span className="submenu-arrow"></span>
//         </div>
//         {isSubmenuOpen && (
//           <ul className="submenu-popup">
//             {item.children.map((child: MenuType) => (
//               <MenuItem
//                 key={getItemKey(child)}
//                 item={child}
//                 mode={mode}
//                 selectedKey={selectedKey}
//                 onSelect={onSelect}
//                 parentKeyPath={[...parentKeyPath, key]}
//                 selectedKeyPath={selectedKeyPath}
//                 onClick={onClick}
//               />
//             ))}
//           </ul>
//         )}
//       </li>
//     );
//   }
//   // 普通项
//   if (item.href) {
//     return (
//       <li
//         className={`menu-item ${selectedKey === key ? 'menu-item-selected' : ''} ${
//           item.disabled ? 'menu-item-disabled' : ''
//         } ${item.danger ? 'menu-item-danger' : ''}`}
//         style={mode === 'horizontal' ? { position: 'relative' } : {}}
//       >
//         <a
//           href={item.href}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="flex items-center w-full h-full"
//           tabIndex={item.disabled ? -1 : 0}
//           aria-disabled={item.disabled}
//           onClick={e => item.disabled && e.preventDefault()}
//         >
//           {item.icon && <span className="menu-item-icon mr-2">{item.icon}</span>}
//           <span className="menu-item-label">{item.label}</span>
//         </a>
//       </li>
//     );
//   }
//   return (
//     <li
//       className={`menu-item${selectedKey === key ? ' menu-item-selected' : ''} ${
//         item.disabled ? ' menu-item-disabled' : ''
//       } ${item.danger ? ' menu-item-danger' : ''}`}
//       onClick={handleClick}
//       style={mode === 'horizontal' ? { position: 'relative' } : {}}
//     >
//       {item.icon && <span className="menu-item-icon mr-2">{item.icon}</span>}
//       <span className="menu-item-label">{item.label}</span>
//     </li>
//   );
// };

// export const Menu: React.FC<MenuProps> = ({
//   items,
//   mode = 'vertical',
//   style,
//   selectedKeys,
//   onClick
// }) => {
//   const [selectedKey, setSelectedKey] = useState<string | undefined>(selectedKeys?.[0]);

//   const selectedKeyPath = useMemo(() => {
//     if (!selectedKey) return [];
//     return findItemPath(items, selectedKey) || [];
//   }, [selectedKey, items]);

//   const handleSelect = (key: string) => {
//     setSelectedKey(key);
//   };
//   return (
//     <ul className={`menu menu-${mode}`} style={style}>
//       {items.map(item => (
//         <MenuItem
//           key={getItemKey(item)}
//           item={item}
//           mode={mode}
//           selectedKey={selectedKey}
//           onSelect={handleSelect}
//           parentKeyPath={[]}
//           selectedKeyPath={selectedKeyPath}
//           onClick={onClick}
//         />
//       ))}
//     </ul>
//   );
// };
