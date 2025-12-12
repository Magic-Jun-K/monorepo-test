-- 为现有的admin账号分配SUPER_ADMIN角色
-- 这个脚本用于修复已经存在的admin账号没有角色的问题

-- 首先确保默认角色存在
INSERT IGNORE INTO role (name, code, type, level, description, isSystem, sortOrder, created_at, updated_at)
VALUES 
('超级管理员', 'SUPER_ADMIN', 'SYSTEM', 10, '系统超级管理员，拥有所有权限', true, 1, NOW(), NOW()),
('管理员', 'ADMIN', 'SYSTEM', 8, '系统管理员，拥有大部分管理权限', true, 2, NOW(), NOW()),
('协调员', 'MODERATOR', 'SYSTEM', 6, '协调员，拥有部分管理权限', true, 3, NOW(), NOW()),
('普通用户', 'USER', 'SYSTEM', 4, '普通用户，拥有基本功能权限', true, 4, NOW(), NOW()),
('访客', 'GUEST', 'SYSTEM', 2, '访客，拥有最基本权限', true, 5, NOW());

-- 为所有userType为INTERNAL的用户分配SUPER_ADMIN角色
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM user u
CROSS JOIN role r
WHERE u.userType = 'INTERNAL' 
  AND r.code = 'SUPER_ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- 查询结果，验证角色分配是否成功
SELECT 
    u.id as user_id,
    u.username,
    u.userType,
    r.id as role_id,
    r.name as role_name,
    r.code as role_code
FROM user u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN role r ON ur.role_id = r.id
WHERE u.userType = 'INTERNAL'
ORDER BY u.id, r.level DESC;