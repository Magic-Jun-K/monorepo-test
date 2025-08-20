/**
 * 角色控制器
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import {
  RoleEntity,
  RoleType,
  RoleLevel,
} from '../../entities/role.entity';
import { RoleService } from './role.service';
import {
  PermissionGuard,
  RequirePermissions,
  RequireRoleLevel,
} from '../../common/guards/permission.guard';
import { PermissionType } from '../../entities/permission.entity';

@ApiTags('角色管理')
@Controller('api/roles')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * 创建角色
   */
  @Post()
  @RequirePermissions(PermissionType.ROLE_CREATE)
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '角色创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '角色名称或代码已存在' })
  async createRole(
    @Body()
    createRoleDto: {
      name: string;
      code: string;
      type?: RoleType;
      level?: RoleLevel;
      description?: string;
      parentId?: number;
      sortOrder?: number;
    },
  ): Promise<RoleEntity> {
    return this.roleService.createRole(createRoleDto);
  }

  /**
   * 获取角色列表
   */
  @Get()
  @RequirePermissions(PermissionType.ROLE_READ)
  @ApiOperation({ summary: '获取角色列表' })
  @ApiResponse({ status: 200, description: '获取角色列表成功' })
  async getRoles(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: RoleType,
    @Query('level') level?: RoleLevel,
    @Query('isActive') isActive?: boolean,
  ): Promise<{ roles: RoleEntity[]; total: number }> {
    return this.roleService.getAllRoles(
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 10,
      search,
      type,
      level,
      isActive,
    );
  }

  /**
   * 获取角色树
   */
  @Get('tree')
  @RequirePermissions(PermissionType.ROLE_READ)
  @ApiOperation({ summary: '获取角色树' })
  @ApiResponse({ status: 200, description: '获取角色树成功' })
  async getRoleTree(): Promise<any[]> {
    return this.roleService.getRoleTree();
  }

  /**
   * 根据ID获取角色
   */
  @Get(':id')
  @RequirePermissions(PermissionType.ROLE_READ)
  @ApiOperation({ summary: '根据ID获取角色' })
  @ApiResponse({ status: 200, description: '获取角色成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async getRoleById(@Param('id') id: number): Promise<RoleEntity> {
    return this.roleService.getRoleById(id);
  }

  /**
   * 更新角色
   */
  @Put(':id')
  @RequirePermissions(PermissionType.ROLE_UPDATE)
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '更新角色' })
  @ApiResponse({ status: 200, description: '角色更新成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 409, description: '角色名称或代码已存在' })
  async updateRole(
    @Param('id') id: number,
    @Body()
    updateRoleDto: {
      name?: string;
      code?: string;
      type?: RoleType;
      level?: RoleLevel;
      description?: string;
      parentId?: number;
      sortOrder?: number;
      isActive?: boolean;
    },
  ): Promise<RoleEntity> {
    return this.roleService.updateRole(id, updateRoleDto);
  }

  /**
   * 删除角色
   */
  @Delete(':id')
  @RequirePermissions(PermissionType.ROLE_DELETE)
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 204, description: '角色删除成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 409, description: '角色无法删除' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Param('id') id: number): Promise<void> {
    await this.roleService.deleteRole(id);
  }

  /**
   * 为用户分配角色
   */
  @Post('users/:userId/roles/:roleId')
  @RequirePermissions(PermissionType.USER_UPDATE, PermissionType.ROLE_UPDATE)
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '为用户分配角色' })
  @ApiResponse({ status: 200, description: '角色分配成功' })
  @ApiResponse({ status: 404, description: '用户或角色不存在' })
  @ApiResponse({ status: 409, description: '用户已拥有该角色' })
  async assignRoleToUser(
    @Param('userId') userId: number,
    @Param('roleId') roleId: number,
  ): Promise<void> {
    await this.roleService.assignRoleToUser(userId, roleId);
  }

  /**
   * 移除用户的角色
   */
  @Delete('users/:userId/roles/:roleId')
  @RequirePermissions(PermissionType.USER_UPDATE, PermissionType.ROLE_UPDATE)
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '移除用户的角色' })
  @ApiResponse({ status: 204, description: '角色移除成功' })
  @ApiResponse({ status: 404, description: '用户角色分配不存在' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRoleFromUser(
    @Param('userId') userId: number,
    @Param('roleId') roleId: number,
  ): Promise<void> {
    await this.roleService.removeRoleFromUser(userId, roleId);
  }

  /**
   * 获取用户的所有角色
   */
  @Get('users/:userId/roles')
  @RequirePermissions(PermissionType.USER_READ, PermissionType.ROLE_READ)
  @ApiOperation({ summary: '获取用户的所有角色' })
  @ApiResponse({ status: 200, description: '获取用户角色成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getUserRoles(@Param('userId') userId: number): Promise<RoleEntity[]> {
    return this.roleService.getUserRoles(userId);
  }

  /**
   * 批量为用户分配角色
   */
  @Post('users/:userId/roles/batch')
  @RequirePermissions(PermissionType.USER_UPDATE, PermissionType.ROLE_UPDATE)
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '批量为用户分配角色' })
  @ApiResponse({ status: 200, description: '批量角色分配成功' })
  @ApiResponse({ status: 404, description: '用户或部分角色不存在' })
  async batchAssignRolesToUser(
    @Param('userId') userId: number,
    @Body()
    batchAssignDto: {
      roleIds: number[];
    },
  ): Promise<void> {
    await this.roleService.batchAssignRolesToUser(
      userId,
      batchAssignDto.roleIds,
    );
  }

  /**
   * 批量移除用户的角色
   */
  @Delete('users/:userId/roles/batch')
  @RequirePermissions(PermissionType.USER_UPDATE, PermissionType.ROLE_UPDATE)
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '批量移除用户的角色' })
  @ApiResponse({ status: 204, description: '批量角色移除成功' })
  @ApiResponse({ status: 404, description: '用户角色分配不存在' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async batchRemoveRolesFromUser(
    @Param('userId') userId: number,
    @Body()
    batchRemoveDto: {
      roleIds: number[];
    },
  ): Promise<void> {
    await this.roleService.batchRemoveRolesFromUser(
      userId,
      batchRemoveDto.roleIds,
    );
  }

  /**
   * 初始化系统默认角色
   */
  @Post('initialize-default')
  @RequirePermissions(PermissionType.ROLE_CREATE)
  @RequireRoleLevel(RoleLevel.SUPER_ADMIN)
  @ApiOperation({ summary: '初始化系统默认角色' })
  @ApiResponse({ status: 200, description: '初始化默认角色成功' })
  async initializeDefaultRoles(): Promise<void> {
    await this.roleService.initializeDefaultRoles();
  }
}
