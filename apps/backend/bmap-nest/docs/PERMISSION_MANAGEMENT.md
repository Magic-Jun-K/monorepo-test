# 权限管理系统使用说明

## 概述

本项目实现了"固定超级管理员 + 动态管理员"的权限管理方案，具有以下优势：

1. **安全性高**：有固定的超级管理员作为最后保障
2. **灵活性强**：可以动态管理普通管理员
3. **审计完整**：所有权限变更都有记录
4. **易于维护**：不需要直接操作数据库
5. **符合最佳实践**：遵循最小权限原则

## 系统架构

### 权限层级

```
超级管理员 (Super Admin)
    ↓
普通管理员 (Admin)
    ↓
普通用户 (User)
```

### 权限控制

- **超级管理员**：拥有所有权限，可以创建/删除管理员、审批权限申请、查看所有审计日志
- **普通管理员**：可以申请管理员权限、查看自己的申请历史
- **普通用户**：只能使用基本功能

## 初始化设置

### 1. 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# 超级管理员配置
SUPER_ADMIN_USERNAME=superadmin
SUPER_ADMIN_PASSWORD=your_secure_password
SUPER_ADMIN_EMAIL=admin@example.com
```

### 2. 创建超级管理员

#### 方法一：使用初始化脚本

```bash
# 在项目根目录运行
cd apps/backend/bmap-nest
npm run build
npx ts-node src/scripts/init-super-admin.ts
```

#### 方法二：通过API创建

```bash
curl -X POST http://localhost:3000/admin/create-super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "your_secure_password",
    "email": "admin@example.com"
  }'
```

## API 接口说明

### 1. 管理员权限管理

#### 申请管理员权限

```bash
POST /admin/request-admin-permission
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetUserId": 123,
  "reason": "需要管理用户权限"
}
```

#### 批准管理员权限申请（仅超级管理员）

```bash
POST /admin/approve-admin-request/:requestId
Authorization: Bearer <token>
```

#### 拒绝管理员权限申请（仅超级管理员）

```bash
POST /admin/reject-admin-request/:requestId
Authorization: Bearer <token>
Content-Type: application/json

{
  "rejectionReason": "权限申请不符合要求"
}
```

#### 撤销管理员权限（仅超级管理员）

```bash
POST /admin/revoke-admin-permission
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetUserId": 123,
  "reason": "违反管理员规定"
}
```

### 2. 查询接口

#### 获取待处理的权限申请（仅超级管理员）

```bash
GET /admin/pending-requests
Authorization: Bearer <token>
```

#### 获取用户申请历史

```bash
GET /admin/user-request-history/:userId
Authorization: Bearer <token>
```

#### 获取所有管理员（仅超级管理员）

```bash
GET /admin/admins
Authorization: Bearer <token>
```

#### 获取审计日志（仅超级管理员）

```bash
GET /admin/audit-logs?page=1&limit=20&userId=123&action=USER_CREATED
Authorization: Bearer <token>
```

### 3. 权限检查接口

#### 检查是否为超级管理员

```bash
GET /admin/is-super-admin
Authorization: Bearer <token>
```

#### 检查是否为管理员

```bash
GET /admin/is-admin
Authorization: Bearer <token>
```

## 使用流程

### 1. 首次部署

1. 配置环境变量
2. 运行初始化脚本创建超级管理员
3. 登录超级管理员账户
4. 验证系统功能正常

### 2. 日常管理

#### 添加新管理员

1. 普通用户或现有管理员提交权限申请
2. 超级管理员审批申请
3. 系统自动更新用户权限
4. 记录审计日志

#### 移除管理员

1. 超级管理员创建撤销申请
2. 系统自动更新用户权限
3. 记录审计日志

### 3. 审计和监控

1. 定期查看审计日志
2. 监控异常权限变更
3. 检查待处理的权限申请
4. 验证管理员权限的合理性

## 安全最佳实践

### 1. 超级管理员安全

- 使用强密码
- 定期更换密码
- 启用双因素认证（如果支持）
- 限制登录IP地址
- 监控登录活动

### 2. 权限管理

- 遵循最小权限原则
- 定期审查管理员权限
- 及时撤销不再需要的权限
- 记录所有权限变更

### 3. 系统配置

- 定期备份数据库
- 监控系统日志
- 更新系统依赖
- 进行安全审计

## 故障排除

### 1. 常见问题

#### 无法创建超级管理员

- 检查环境变量配置
- 确认数据库连接正常
- 查看系统日志

#### 权限申请无法提交

- 确认用户已登录
- 检查token是否有效
- 验证目标用户是否存在

#### 审批操作失败

- 确认操作者为超级管理员
- 检查申请状态是否为待处理
- 验证申请ID是否正确

### 2. 调试方法

#### 查看审计日志

```bash
GET /admin/audit-logs
Authorization: Bearer <super_admin_token>
```

#### 检查用户权限

```bash
GET /admin/is-admin
Authorization: Bearer <user_token>

GET /admin/is-super-admin
Authorization: Bearer <user_token>
```

#### 检查待处理申请

```bash
GET /admin/pending-requests
Authorization: Bearer <super_admin_token>
```

## 数据库表结构

### 1. 用户表 (user)

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | number | 用户ID |
| username | string | 用户名 |
| email | string | 邮箱 |
| userType | enum | 用户类型 (admin/user) |
| isActive | boolean | 是否激活 |
| createdAt | date | 创建时间 |
| updatedAt | date | 更新时间 |

### 2. 权限申请表 (permission_request)

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | number | 申请ID |
| requestType | enum | 申请类型 |
| status | enum | 申请状态 |
| reason | string | 申请理由 |
| requestedById | number | 申请人ID |
| approvedById | number | 审批人ID |
| targetUserId | number | 目标用户ID |
| createdAt | date | 创建时间 |
| updatedAt | date | 更新时间 |

### 3. 审计日志表 (audit_log)

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | number | 日志ID |
| action | enum | 操作类型 |
| description | string | 操作描述 |
| details | json | 详细信息 |
| userId | number | 操作用户ID |
| targetUserId | number | 目标用户ID |
| ipAddress | string | IP地址 |
| userAgent | string | 用户代理 |
| result | string | 操作结果 |
| createdAt | date | 创建时间 |

## 更新日志

### v1.0.0 (2024-01-01)

- 实现基础权限管理系统
- 支持超级管理员和普通管理员
- 添加权限申请和审批流程
- 实现审计日志功能
- 提供完整的API接口

## 联系支持

如有问题或建议，请联系开发团队。