/**
 * 初始化超级管理员脚本
 * 用于系统首次部署时创建超级管理员账户
 */
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { AppModule } from '../src/app.module';
import { AdminService } from '../src/module/admin/admin.service';

async function initSuperAdmin() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('InitSuperAdmin');

  try {
    const adminService = app.get(AdminService);
    const configService = app.get(ConfigService);

    // 从环境变量获取超级管理员配置
    const superAdminUsername =
      configService.get<string>('SUPER_ADMIN_USERNAME') || 'superAdmin';
    const superAdminPassword =
      configService.get<string>('SUPER_ADMIN_PASSWORD') || 'TtoP%1pVKL@4*Mnzsi&$';
    const superAdminEmail = configService.get<string>('SUPER_ADMIN_EMAIL');

    logger.log('正在创建超级管理员账户...');
    logger.log('用户名:', superAdminUsername);

    // 创建超级管理员
    const superAdmin = await adminService.createSuperAdmin(
      superAdminUsername,
      superAdminPassword,
      superAdminEmail,
    );

    logger.log('✅ 超级管理员创建成功!');
    logger.log('用户ID:', superAdmin.id);
    logger.log('用户名:', superAdmin.username);
    logger.log('邮箱:', superAdmin.email || '未设置');
    logger.log('创建时间:', superAdmin.createdAt);

    logger.log('\n⚠️  重要提醒:');
    logger.log('1. 请立即登录系统并修改默认密码');
    logger.log('2. 请妥善保管超级管理员账户信息');
    logger.log('3. 建议在生产环境中使用强密码');
  } catch (error) {
    logger.error('❌ 创建超级管理员失败:', error.message);

    if (error.message.includes('已存在')) {
      logger.log('超级管理员已存在，跳过创建');
    }
  } finally {
    await app.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  initSuperAdmin()
    .then(() => process.exit(0))
    .catch(() => {
      process.exit(1);
    });
}

export { initSuperAdmin };
