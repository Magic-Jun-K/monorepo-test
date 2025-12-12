/**
 * 重置超级管理员密码脚本
 * 用于修复密码验证问题
 */
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { AppModule } from '../src/app.module';
import { AdminService } from '../src/module/admin/admin.service';
import { UserEntity, UserType } from '../src/entities/user.entity';
import { AuthUtils } from '../src/common/utils/auth.utils';

const logger = new Logger('ResetSuperAdmin');

async function resetSuperAdmin() {
  const app = await NestFactory.create(AppModule);

  try {
    const configService = app.get(ConfigService);
    const userRepository = app.get(
      'UserEntityRepository',
    ) as Repository<UserEntity>;

    // 从环境变量获取超级管理员配置
    const superAdminUsername =
      configService.get<string>('SUPER_ADMIN_USERNAME') || 'superAdmin';
    const superAdminPassword =
      configService.get<string>('SUPER_ADMIN_PASSWORD') || 'TtoP%1pVKL@4*Mnzsi&$';

    logger.log('正在重置超级管理员密码...');
    logger.log('用户名:', superAdminUsername);

    // 查找现有的superadmin用户
    const existingAdmin = await userRepository.findOne({
      where: { username: superAdminUsername, userType: UserType.INTERNAL },
    });

    if (!existingAdmin) {
      logger.log('未找到超级管理员用户，正在创建...');
      const adminService = app.get(AdminService);
      await adminService.createSuperAdmin(
        superAdminUsername,
        superAdminPassword,
        'admin@example.com',
      );
    } else {
      logger.log('找到现有超级管理员，正在重置密码...');

      // 对密码进行哈希处理后再保存
      // 使用与前端相同的加密逻辑，确保格式一致
      const authUtils = app.get(AuthUtils);

      // 使用现有的hashPassword方法
      const hashedPassword = await authUtils.hashPassword(superAdminPassword);
      existingAdmin.password = hashedPassword;
      await userRepository.save(existingAdmin);

      logger.log('✅ 超级管理员密码重置成功!');
      logger.log('用户ID:', existingAdmin.id);
      logger.log('用户名:', existingAdmin.username);
      logger.log('请使用以下凭据登录:');
      logger.log('用户名:', superAdminUsername);
      logger.log('密码:', superAdminPassword);
    }

    logger.log('\n⚠️  重要提醒:');
    logger.log('1. 请立即登录系统并修改默认密码');
    logger.log('2. 请妥善保管超级管理员账户信息');
    logger.log('3. 建议在生产环境中使用强密码');
  } catch (error) {
    logger.error('❌ 重置超级管理员失败:', error.message);
    throw error;
  } finally {
    await app.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  resetSuperAdmin()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('脚本执行失败:', error);
      process.exit(1);
    });
}

export { resetSuperAdmin };
