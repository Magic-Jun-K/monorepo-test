/**
 * 权限控制器
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
  Request,
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
  PermissionEntity,
  PermissionType,
  ResourceType,
} from '../../entities/permission.entity';
import { RolePermissionEntity } from '../../entities/role-permission.entity';
import { PermissionService } from './permission.service';
import {
  PermissionGuard,
  RequirePermissions,
  RequireRoleLevel,
} from '../../common/guards/permission.guard';
import { RoleLevel } from '../../entities/role.entity';

@ApiTags('权限管理')
@Controller('api/permissions')
@UseGuards(AuthGuard('jwt'), PermissionGuard)
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * 创建权限
   */
  @Post()
  @RequirePermissions(PermissionType.PERMISSION_CREATE)
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: 201, description: '权限创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '权限名称或代码已存在' })
  async createPermission(
    @Request() req,
    @Body()
    createPermissionDto: {
      name: string;
      code: string;
      type: PermissionType;
      resourceType: ResourceType;
      description?: string;
      level?: number;
      parentId?: number;
    },
  ): Promise<PermissionEntity> {
    return this.permissionService.createPermission({
      ...createPermissionDto,
    });
  }

  /**
   * 获取权限列表
   */
  @Get()
  @RequirePermissions(PermissionType.PERMISSION_READ)
  @ApiOperation({ summary: '获取权限列表' })
  @ApiResponse({ status: 200, description: '获取权限列表成功' })
  async getPermissions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: PermissionType,
    @Query('resourceType') resourceType?: ResourceType,
  ): Promise<{ permissions: PermissionEntity[]; total: number }> {
    return this.permissionService.getAllPermissions(
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 10,
      search,
      type,
      resourceType,
    );
  }

  /**
   * 获取权限树
   */
  @Get('tree')
  @RequirePermissions(PermissionType.PERMISSION_READ)
  @ApiOperation({ summary: '获取权限树' })
  @ApiResponse({ status: 200, description: '获取权限树成功' })
  async getPermissionTree(): Promise<any[]> {
    return this.permissionService.getPermissionTree();
  }

  /**
   * 根据ID获取权限
   */
  @Get(':id')
  @RequirePermissions(PermissionType.PERMISSION_READ)
  @ApiOperation({ summary: '根据ID获取权限' })
  @ApiResponse({ status: 200, description: '获取权限成功' })
  @ApiResponse({ status: 404, description: '权限不存在' })
  async getPermissionById(@Param('id') id: number): Promise<PermissionEntity> {
    return this.permissionService.getPermissionById(id);
  }

  /**
   * 更新权限
   */
  @Put(':id')
  @RequirePermissions(PermissionType.PERMISSION_UPDATE)
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({ status: 200, description: '权限更新成功' })
  @ApiResponse({ status: 404, description: '权限不存在' })
  @ApiResponse({ status: 409, description: '权限名称或代码已存在' })
  async updatePermission(
    @Param('id') id: number,
    @Body()
    updatePermissionDto: {
      name?: string;
      code?: string;
      type?: PermissionType;
      resourceType?: ResourceType;
      description?: string;
      level?: number;
      parentId?: number;
      isActive?: boolean;
    },
  ): Promise<PermissionEntity> {
    return this.permissionService.updatePermission(id, updatePermissionDto);
  }

  /**
   * 删除权限
   */
  @Delete(':id')
  @RequirePermissions(PermissionType.PERMISSION_DELETE)
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 204, description: '权限删除成功' })
  @ApiResponse({ status: 404, description: '权限不存在' })
  @ApiResponse({ status: 409, description: '权限无法删除' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePermission(@Param('id') id: number): Promise<void> {
    await this.permissionService.deletePermission(id);
  }

  /**
   * 为角色分配权限
   */
  @Post('roles/:roleId/permissions/:permissionId')
  @RequirePermissions(
    PermissionType.ROLE_UPDATE,
    PermissionType.PERMISSION_UPDATE,
  )
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '为角色分配权限' })
  @ApiResponse({ status: 201, description: '权限分配成功' })
  @ApiResponse({ status: 404, description: '角色或权限不存在' })
  @ApiResponse({ status: 409, description: '权限已分配' })
  async assignPermissionToRole(
    @Request() req,
    @Param('roleId') roleId: number,
    @Param('permissionId') permissionId: number,
    @Body()
    assignPermissionDto: {
      expiresAt?: Date;
      remarks?: string;
    },
  ): Promise<RolePermissionEntity> {
    return this.permissionService.assignPermissionToRole(
      roleId,
      permissionId,
      req.user.username,
      assignPermissionDto.expiresAt,
      assignPermissionDto.remarks,
    );
  }

  /**
   * 移除角色的权限
   */
  @Delete('roles/:roleId/permissions/:permissionId')
  @RequirePermissions(
    PermissionType.ROLE_UPDATE,
    PermissionType.PERMISSION_UPDATE,
  )
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '移除角色的权限' })
  @ApiResponse({ status: 204, description: '权限移除成功' })
  @ApiResponse({ status: 404, description: '角色权限分配不存在' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePermissionFromRole(
    @Param('roleId') roleId: number,
    @Param('permissionId') permissionId: number,
  ): Promise<void> {
    await this.permissionService.removePermissionFromRole(roleId, permissionId);
  }

  /**
   * 获取角色的所有权限
   */
  @Get('roles/:roleId/permissions')
  @RequirePermissions(PermissionType.ROLE_READ, PermissionType.PERMISSION_READ)
  @ApiOperation({ summary: '获取角色的所有权限' })
  @ApiResponse({ status: 200, description: '获取角色权限成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async getRolePermissions(
    @Param('roleId') roleId: number,
  ): Promise<PermissionEntity[]> {
    return this.permissionService.getRolePermissions(roleId);
  }

  /**
   * 批量为角色分配权限
   */
  @Post('roles/:roleId/permissions/batch')
  @RequirePermissions(
    PermissionType.ROLE_UPDATE,
    PermissionType.PERMISSION_UPDATE,
  )
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '批量为角色分配权限' })
  @ApiResponse({ status: 201, description: '批量权限分配成功' })
  @ApiResponse({ status: 404, description: '角色或部分权限不存在' })
  async batchAssignPermissionsToRole(
    @Request() req,
    @Param('roleId') roleId: number,
    @Body()
    batchAssignDto: {
      permissionIds: number[];
    },
  ): Promise<RolePermissionEntity[]> {
    return this.permissionService.batchAssignPermissionsToRole(
      roleId,
      batchAssignDto.permissionIds,
      req.user.username,
    );
  }

  /**
   * 批量移除角色的权限
   */
  @Delete('roles/:roleId/permissions/batch')
  @RequirePermissions(
    PermissionType.ROLE_UPDATE,
    PermissionType.PERMISSION_UPDATE,
  )
  @RequireRoleLevel(RoleLevel.ADMIN)
  @ApiOperation({ summary: '批量移除角色的权限' })
  @ApiResponse({ status: 204, description: '批量权限移除成功' })
  @ApiResponse({ status: 404, description: '角色权限分配不存在' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async batchRemovePermissionsFromRole(
    @Param('roleId') roleId: number,
    @Body()
    batchRemoveDto: {
      permissionIds: number[];
    },
  ): Promise<void> {
    await this.permissionService.batchRemovePermissionsFromRole(
      roleId,
      batchRemoveDto.permissionIds,
    );
  }
}
