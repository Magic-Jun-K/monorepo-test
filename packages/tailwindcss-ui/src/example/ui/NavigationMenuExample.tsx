import { useState } from 'react';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../../components/ui/navigation-menu';
import { cn } from '@/lib/utils';

export function NavigationMenuExample() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold mb-4">导航菜单组件</h2>
        <div className="flex flex-wrap gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>产品</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            产品中心
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            了解我们所有的产品和服务
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/products/web" title="Web 应用">
                      构建现代化的 Web 应用程序
                    </ListItem>
                    <ListItem href="/products/mobile" title="移动应用">
                      开发跨平台移动解决方案
                    </ListItem>
                    <ListItem href="/products/desktop" title="桌面应用">
                      创建高性能桌面应用程序
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>解决方案</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {solutions.map((solution) => (
                      <ListItem
                        key={solution.title}
                        title={solution.title}
                        href={solution.href}
                      >
                        {solution.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/docs"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  文档
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">简单导航</h2>
        <div className="flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/home"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  首页
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/about"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  关于我们
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/contact"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  联系我们
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">复杂多层级菜单</h2>
        <div className="flex flex-wrap gap-4">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/home"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  首页
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>测试中心</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <ListItem href="/image-test" title="图片测试">
                      图片加载和处理测试
                    </ListItem>
                    <ListItem href="/form-test" title="表单测试">
                      各种表单组件和验证测试
                    </ListItem>
                    <ListItem href="/table-test" title="表格测试">
                      数据表格展示和交互测试
                    </ListItem>
                    <ListItem href="/virtual-list-test" title="虚拟列表测试">
                      大数据量列表渲染优化测试
                    </ListItem>
                    <ListItem href="/baidu-map" title="百度地图测试">
                      地图组件集成和功能测试
                    </ListItem>
                    <ListItem href="/tailwind-test" title="TailwindCSS测试">
                      TailwindCSS 样式和组件测试
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuTrigger>系统设置</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <SystemSettingsMenu />
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">自定义业务组件</h2>
        <div className="p-6 bg-card rounded-lg border">
          <p className="text-muted-foreground mb-4">
            这里是你可以扩展自定义业务组件的地方。基于 shadcn 的设计系统，
            你可以创建符合业务需求的导航菜单组件，同时保持一致的设计语言。
          </p>
          <div className="flex gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/dashboard"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    控制台
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/settings"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                  >
                    设置
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </section>
    </div>
  );
}

const solutions = [
  {
    title: "企业解决方案",
    href: "/solutions/enterprise",
    description: "为大型企业提供定制化的解决方案",
  },
  {
    title: "中小企业方案",
    href: "/solutions/sme",
    description: "专为中小企业设计的高效解决方案",
  },
  {
    title: "云服务",
    href: "/solutions/cloud",
    description: "安全可靠的云计算服务",
  },
  {
    title: "数据分析",
    href: "/solutions/analytics",
    description: "强大的数据分析和可视化工具",
  },
];

// 创建一个不使用<li>元素的 ListItem 替代组件，用于嵌套场景
const NestedListItem = ({
  className,
  title,
  children,
  href,
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <div>
      <NavigationMenuLink asChild>
        <a
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </div>
  );
};

const ListItem = ({
  className,
  title,
  children,
  href,
}: {
  className?: string;
  title: string;
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          href={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
};

// 创建系统设置菜单组件
const SystemSettingsMenu = () => {
  const [activeMenu, setActiveMenu] = useState('user-management');
  
  interface MenuItem {
    key: string;
    label: string;
    children?: MenuItem[];
    description?: string;
    href?: string;
  }
  
  // 菜单数据结构
  const menuData: MenuItem[] = [
    {
      key: 'user-management',
      label: '用户与权限管理',
      children: [
        {
          key: 'user-list',
          label: '用户管理',
          description: '管理系统用户账户和基本信息',
          href: '/user-management'
        },
        {
          key: 'role-permission',
          label: '角色与权限',
          children: [
            {
              key: 'role-list',
              label: '角色管理',
              description: '创建和管理系统角色',
              href: '/settings/roles'
            },
            {
              key: 'permission-list',
              label: '权限分配',
              description: '为角色分配具体权限',
              href: '/settings/permissions'
            },
            {
              key: 'audit-log',
              label: '权限审计',
              description: '审查权限分配和使用情况',
              href: '/settings/audit'
            }
          ]
        },
        {
          key: 'security-policy',
          label: '安全策略',
          children: [
            {
              key: 'login-limit',
              label: '登录限制',
              description: '配置登录安全策略和限制',
              href: '/settings/login-limit'
            }
          ]
        }
      ]
    },
    {
      key: 'monitoring-security',
      label: '监控与安全',
      children: [
        {
          key: 'monitoring',
          label: '实时监控',
          children: [
            {
              key: 'system-monitor',
              label: '系统资源监控',
              description: '监控服务器CPU、内存等资源使用情况',
              href: '/monitoring/system'
            },
            {
              key: 'service-health',
              label: '服务健康状态',
              description: '检查各项服务的运行状态和性能指标',
              href: '/monitoring/performance'
            },
            {
              key: 'user-behavior',
              label: '用户行为监控',
              description: '分析用户操作行为和使用习惯',
              href: '/monitoring/user-behavior'
            }
          ]
        },
        {
          key: 'error-log',
          label: '错误日志',
          children: [
            {
              key: 'log-classify',
              label: '日志分类',
              description: '对系统错误日志进行分类管理',
              href: '/error-log/classify'
            },
            {
              key: 'log-search',
              label: '日志搜索与分析',
              description: '搜索和分析错误日志以定位问题',
              href: '/error-log/search'
            },
            {
              key: 'log-alarm',
              label: '自动告警',
              description: '配置错误日志自动告警机制',
              href: '/error-log/alarm'
            }
          ]
        }
      ]
    },
    {
      key: 'advanced-settings',
      label: '高级设置',
      children: [
        {
          key: 'custom-menu',
          label: '自定义菜单',
          children: [
            {
              key: 'menu-sort',
              label: '功能模块排序',
              description: '自定义菜单项的显示顺序',
              href: '/custom-menu/sort'
            },
            {
              key: 'menu-hide',
              label: '隐藏/禁用菜单项',
              description: '隐藏或禁用不需要的菜单项',
              href: '/custom-menu/hide'
            }
          ]
        },
        {
          key: 'system-upgrade',
          label: '系统升级',
          children: [
            {
              key: 'version-management',
              label: '版本发布管理',
              description: '管理系统的版本发布和更新',
              href: '/system-upgrade'
            }
          ]
        }
      ]
    }
  ];
  
  // 渲染菜单项
  const renderMenuItems = (items: MenuItem[], level = 0) => {
    return (
      <div className={level > 0 ? "ml-4 space-y-1" : "space-y-1"}>
        {items.map((item) => (
          <div key={item.key}>
            {item.children ? (
              <>
                <div 
                  className={cn(
                    "p-2 text-sm rounded cursor-pointer",
                    level === 0 
                      ? "font-medium hover:bg-accent hover:text-accent-foreground" 
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </div>
                {renderMenuItems(item.children, level + 1)}
              </>
            ) : (
              <NestedListItem 
                href={item.href!} 
                title={item.label}
              >
                {item.description}
              </NestedListItem>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex w-[500px]">
      {/* 一级菜单 */}
      <div className="w-1/3 bg-muted p-2">
        {menuData.map((menu) => (
          <button
            key={menu.key}
            type="button"
            className={cn(
              "p-2 text-sm rounded cursor-pointer mb-1 w-full text-left",
              activeMenu.startsWith(menu.key) 
                ? "bg-accent text-accent-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => setActiveMenu(menu.key)}
          >
            {menu.label}
          </button>
        ))}
      </div>
      
      {/* 二级及以下菜单 */}
      <div className="w-2/3 p-2">
        {menuData
          .find((menu) => activeMenu.startsWith(menu.key))
          ?.children && renderMenuItems(
            menuData.find((menu) => activeMenu.startsWith(menu.key))!.children!
          )}
      </div>
    </div>
  );
};
