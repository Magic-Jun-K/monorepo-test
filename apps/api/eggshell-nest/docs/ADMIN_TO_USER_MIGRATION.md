# Admin表到User表迁移指南

## 概述

本项目已经完成了将admin表功能迁移到user表的工作。现在admin和用户都使用同一个user表，通过userType字段区分用户类型（'admin'或'user'）。

## 已完成的代码修改

### 1. 服务层修改

#### admin.service.ts
- 将AdminEntity导入改为UserEntity
- 将AdminRepository改为UserRepository
- 修改register方法，添加userType: 'admin'和isActive: true字段

#### user.service.ts
- 移除AdminEntity导入和AdminRepository依赖
- 移除syncAdminUsersToUserTable和syncMissingAdminUsersToUserTable同步方法
- 修改create方法，添加userType默认值'user'和isActive默认值true
- 修改importUsers方法，添加userType和isActive字段默认值
- 修改exportUsers方法，添加userType和isActive字段到导出数据

### 2. DTO修改

#### create-user.dto.ts
- 在CreateUserSchema中添加userType字段（可选，枚举类型['user', 'admin']，默认值'user'）
- 添加isActive字段（可选，布尔类型，默认值true）

### 3. 模块修改

#### admin.module.ts
- 将AdminEntity导入改为UserEntity
- 将TypeOrmModule.forFeature([AdminEntity])改为TypeOrmModule.forFeature([UserEntity])

#### user.module.ts
- 移除AdminEntity导入
- 从TypeOrmModule.forFeature中移除AdminEntity

#### auth.module.ts
- 将AdminModule导入改为UserModule
- 将AdminEntity导入改为UserEntity
- 将TypeOrmModule.forFeature([AdminEntity])改为TypeOrmModule.forFeature([UserEntity])

## 数据迁移步骤

### 1. 执行SQL迁移脚本

项目根目录提供了`migration-admin-to-user.sql`脚本，用于将admin表数据迁移到user表。

```sql
-- 在数据库中执行以下脚本
-- 文件路径: migration-admin-to-user.sql
```

该脚本会：
- 将admin表的所有记录迁移到user表
- 为迁移的用户设置userType为'admin'，isActive为true
- 自动设置创建时间和更新时间
- 避免重复迁移（通过WHERE条件过滤已存在的admin用户）

### 2. 验证迁移结果

执行以下SQL查询验证迁移结果：

```sql
-- 查看迁移后的admin用户数量
SELECT COUNT(*) as admin_users_count FROM user WHERE userType = 'admin';

-- 查看所有admin用户
SELECT id, username, phone, email, userType, isActive, created_at, updated_at 
FROM user 
WHERE userType = 'admin'
ORDER BY id;
```

### 3. 清理工作（可选）

确认迁移成功后，可以考虑删除admin表：

```sql
-- 谨慎操作：删除admin表
DROP TABLE admin;
```

## 注意事项

1. **数据库备份**：在执行迁移脚本前，请务必备份数据库
2. **数据冲突**：如果admin表中有重复的username、phone或email，可能会导致迁移冲突
3. **测试验证**：迁移完成后，建议在测试环境中验证所有功能正常
4. **生产环境**：在生产环境执行迁移时，建议在低峰期进行

## 功能验证

迁移完成后，请验证以下功能：

1. **管理员注册**：通过admin接口注册管理员，检查user表中是否正确创建了userType为'admin'的记录
2. **用户注册**：通过user接口注册普通用户，检查user表中是否正确创建了userType为'user'的记录
3. **认证登录**：验证admin和user都能正常登录系统
4. **用户管理**：验证用户列表、导入、导出功能正常工作
5. **权限控制**：验证admin和user的权限控制正常

## 故障排除

### 常见问题

1. **迁移脚本执行失败**
   - 检查user表是否存在userType和isActive字段
   - 检查是否有数据冲突（重复的username、phone、email）

2. **认证失败**
   - 检查auth.module.ts是否正确配置了UserEntity
   - 检查JWT策略是否正确处理userType字段

3. **权限问题**
   - 检查角色权限配置是否正确
   - 确认admin用户具有正确的权限

### 调试建议

1. 查看日志文件，确认没有错误信息
2. 使用数据库工具直接查询user表，验证数据结构
3. 逐步测试每个功能模块，定位问题所在

## 总结

通过这次迁移，我们实现了：
- 统一的用户管理模型
- 简化的数据库结构
- 更清晰的权限控制
- 更好的代码维护性

如果遇到任何问题，请参考上述故障排除部分或联系开发团队。