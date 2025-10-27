import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  UseGuards,
  Req,
  Put,
  Delete,
  Param,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { PermissionGuard } from '../../common/guards/permission.guard';
import {
  RequirePermissions,
  RequireRoleLevel,
} from '../../common/guards/permission.guard';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { RoleService } from '../role/role.service';
import { PermissionType } from '../../entities/permission.entity';
import { RoleLevel } from '../../entities/role.entity';
import { AuthUser } from '../../module/auth/types/user.interface';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
  ) {}

  /**
   * 用户列表（带搜索、分页）
   * @param query
   * @returns
   */
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(PermissionType.USER_MANAGE, PermissionType.USER_READ)
  @Post('list')
  async findAll(@Body() query: Record<string, unknown>, @Req() req: { user: AuthUser }) {
    const currentUser = req.user;
    const result = await this.userService.findAll(query || {}, currentUser);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 新增用户
   * @param createUserDto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(PermissionType.USER_MANAGE, PermissionType.USER_CREATE)
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateUserSchema)) createUserDto: CreateUserDto,
  ) {
    try {
      const result = await this.userService.create(createUserDto);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '新增用户失败',
      };
    }
  }

  /**
   * 导入用户（上传文件）
   * @param file
   * @returns
   */
  @Post('import')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(PermissionType.USER_MANAGE, PermissionType.USER_CREATE)
  @UseInterceptors(FileInterceptor('file'))
  async import(@UploadedFile() file: Express.Multer.File) {
    try {
      this.logger.log('📁 收到导入文件请求:', {
        filename: file?.originalname,
        size: file?.size,
        mimetype: file?.mimetype
      });
      
      const result = await this.userService.importUsers(file);
      this.logger.log('✅ 导入处理完成:', result);
      
      return {
        success: true,
        data: result,
      };
    } catch (error: unknown) {
      this.logger.error('❌ 导入用户失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '导入用户失败',
      };
    }
  }

  /**
   * 导出用户
   * @param query
   * @param res
   * @returns
   */
  @Get('export')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(PermissionType.USER_MANAGE, PermissionType.USER_READ)
  async export(@Query() query: Record<string, unknown>, @Res() res: Response, @Req() req: { user: AuthUser }) {
    const currentUser = req.user;
    await this.userService.exportUsers(query, res, currentUser);
  }

  /**
   * 批量导出用户
   * @param ids
   * @param res
   * @returns
   */
  @Post('batch-export')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(PermissionType.USER_MANAGE, PermissionType.USER_READ)
  async batchExport(
    @Body('ids') ids: number[],
    @Res() res: Response,
    @Req() req: { user: AuthUser },
  ) {
    const currentUser = req.user;
    await this.userService.batchExportUsers(ids, res, currentUser);
  }

  /**
   * 更新用户
   * @param id
   * @param updateUserDto
   * @returns
   */
  @Put(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(PermissionType.USER_MANAGE, PermissionType.USER_UPDATE)
  async update(@Param('id') id: number, @Body() updateUserDto: Record<string, unknown>) {
    const result = await this.userService.update(id, updateUserDto);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 删除用户
   * @param id
   * @returns
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(PermissionType.USER_MANAGE, PermissionType.USER_DELETE)
  async delete(@Param('id') id: number) {
    const result = await this.userService.delete(id);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 为用户分配角色
   * @param userId
   * @param roleIds
   * @returns
   */
  @Post(':userId/roles')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(PermissionType.USER_MANAGE, PermissionType.ROLE_MANAGE)
  async assignRoles(
    @Param('userId') userId: number,
    @Body('roleIds') roleIds: number[],
  ) {
    const result = await this.roleService.batchAssignRolesToUser(
      userId,
      roleIds,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 移除用户角色
   * @param userId
   * @param roleIds
   * @returns
   */
  @Delete(':userId/roles')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(PermissionType.USER_MANAGE, PermissionType.ROLE_MANAGE)
  async removeRoles(
    @Param('userId') userId: number,
    @Body('roleIds') roleIds: number[],
  ) {
    const result = await this.roleService.batchRemoveRolesFromUser(
      userId,
      roleIds,
    );
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 获取用户角色
   * @param userId
   * @returns
   */
  @Get(':userId/roles')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(PermissionType.USER_MANAGE, PermissionType.USER_READ)
  async getUserRoles(@Param('userId') userId: number) {
    const result = await this.roleService.getUserRoles(userId);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 设置用户为超级管理员
   * @param userId
   * @returns
   */
  @Put(':userId/super-admin')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequireRoleLevel(RoleLevel.SUPER_ADMIN)
  async setSuperAdmin(
    @Param('userId') userId: number,
    @Body('isSuperAdmin') isSuperAdmin: boolean,
  ) {
    const result = await this.userService.setSuperAdmin(userId, isSuperAdmin);
    return {
      success: true,
      data: result,
    };
  }

  /**
   * 批量删除用户
   * @param ids
   * @returns
   */
  @Delete('batch')
  @UseGuards(AuthGuard('jwt'), PermissionGuard)
  @RequirePermissions(PermissionType.USER_MANAGE, PermissionType.USER_DELETE)
  async batchDelete(@Body('ids') ids: number[]) {
    const result = await this.userService.batchDelete(ids);
    return {
      success: true,
      data: result,
    };
  }
}