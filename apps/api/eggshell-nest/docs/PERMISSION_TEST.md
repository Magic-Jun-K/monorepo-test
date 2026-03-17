# 权限管理系统测试指南

基于已实现的"固定超级管理员+动态管理员"权限管理方案，以下是完整的测试流程：

## 1. 环境准备

### 1.1 初始化超级管理员

首先运行初始化脚本创建超级管理员：

```bash
cd d:/Files/VSCode/BaiduMap/monorepo-test/apps/api/eggshell-nest
npm run ts-node scripts/init-super-admin.ts
```

或者使用环境变量配置：

```bash
set SUPER_ADMIN_USERNAME=admin
set SUPER_ADMIN_PASSWORD=securePassword123
set SUPER_ADMIN_EMAIL=admin@example.com
npm run ts-node scripts/init-super-admin.ts
```

### 1.2 启动后端服务

```bash
npm run start:dev
```

服务将在 `http://localhost:7000` 启动（根据.env配置）。

## 2. 权限管理功能测试

### 2.1 超级管理员权限测试

**登录超级管理员：**

```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"securePassword123"}'
```

**创建普通管理员：**

```bash
curl -X POST http://localhost:7000/admin/create \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","password":"admin123","email":"testadmin@example.com"}'
```

**查看所有管理员：**

```bash
curl -X GET http://localhost:7000/admin/list \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

### 2.2 动态管理员权限申请测试

**普通管理员申请特定权限：**

```bash
curl -X POST http://localhost:7000/admin/permission/request \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permission":"user_management","reason":"需要管理用户账户"}'
```

**超级管理员审批权限申请：**

```bash
curl -X POST http://localhost:7000/admin/permission/approve \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId":"REQUEST_ID","approved":true,"comment":"审批通过"}'
```

**查看权限申请历史：**

```bash
curl -X GET http://localhost:7000/admin/permission/requests \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

### 2.3 权限控制测试

**测试权限守卫：**
尝试使用普通管理员访问需要超级管理员权限的接口：

```bash
curl -X DELETE http://localhost:7000/admin/delete/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

预期结果：返回403 Forbidden错误。

**测试特定权限控制：**

```bash
curl -X POST http://localhost:7000/users/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","email":"newuser@example.com"}'
```

如果该管理员没有user_management权限，应该返回403错误。

## 3. 审计日志验证

**查看审计日志：**

```bash
curl -X GET http://localhost:7000/admin/audit-logs \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN"
```

验证日志中包含以下操作记录：

- 超级管理员创建
- 管理员创建/删除
- 权限申请
- 权限审批
- 权限变更

## 4. 前端集成测试

### 4.1 启动前端服务

```bash
cd d:/Files/VSCode/BaiduMap/monorepo-test/apps/frontend/react-webpack
npm start
```

### 4.2 前端功能测试

1. **登录功能测试**：使用超级管理员和普通管理员账户分别登录
2. **权限界面测试**：验证不同角色看到的菜单和功能不同
3. **权限申请流程**：在前端界面提交权限申请并跟踪审批状态
4. **权限管理界面**：超级管理员可以查看和审批权限申请

## 5. 数据库验证

连接PostgreSQL数据库，验证相关表数据：

```sql
-- 查看用户表
SELECT * FROM users WHERE role IN ('super_admin', 'admin');

-- 查看权限申请表
SELECT * FROM permission_requests;

-- 查看审计日志表
SELECT * FROM audit_logs WHERE action IN ('PERMISSION_REQUEST', 'PERMISSION_APPROVAL');
```

## 6. 安全测试

### 6.1 Token验证测试

- 使用过期Token访问API
- 使用无效Token访问API
- 不携带Token访问受保护接口

### 6.2 权限边界测试

- 普通管理员尝试执行超级管理员专属操作
- 未授权用户尝试访问管理员接口
- 权限申请后的权限范围验证

## 7. 性能测试

```bash
# 并发登录测试
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:7000/admin/profile

# 权限验证性能测试
ab -n 1000 -c 50 -H "Authorization: Bearer YOUR_TOKEN" http://localhost:7000/admin/permission/check
```

## 8. 故障恢复测试

1. **数据库恢复测试**：删除测试数据后重新初始化
2. **服务重启测试**：重启服务后验证权限状态保持
3. **Token刷新测试**：验证Token过期后的刷新机制

## 测试检查清单

- [ ] 超级管理员成功创建
- [ ] 普通管理员创建成功
- [ ] 权限申请流程正常
- [ ] 权限审批机制有效
- [ ] 权限守卫正确拦截未授权访问
- [ ] 审计日志完整记录
- [ ] 前端界面权限控制正确
- [ ] 数据库数据一致性
- [ ] 安全机制有效
- [ ] 性能指标达标

通过以上测试步骤，可以全面验证"固定超级管理员+动态管理员"权限管理方案的完整性和安全性。
