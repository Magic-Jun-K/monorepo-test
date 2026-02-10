import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AdminService } from './admin.service';

import type { AuditAction } from '../../entities/audit-log.entity';

import { AdminGuard, SuperAdminGuard } from '../../common/guards/admin.guard';

@ApiTags('管理员')
@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  /**
   * 用户注册
   * @param username 用户名
   * @param password 前端传递的哈希值
   * @returns 注册结果
   */
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 200, description: '注册成功' })
  async register(@Body() body) {
    this.logger.log('测试register body', body);

    // 保存用户信息到数据库
    await this.adminService.register(body);

    return { message: '注册成功', success: true };
  }

  /**
   * 创建超级管理员账户
   * @param body 包含用户名、密码、邮箱
   * @returns 创建的超级管理员
   */
  @Post('create-super-admin')
  @ApiOperation({ summary: '创建超级管理员账户' })
  @ApiResponse({ status: 200, description: '超级管理员创建成功' })
  async createSuperAdmin(@Body() body: { username: string; password: string; email?: string }) {
    const superAdmin = await this.adminService.createSuperAdmin(
      body.username,
      body.password,
      body.email,
    );

    return {
      message: '超级管理员创建成功',
      success: true,
      data: {
        id: superAdmin.id,
        username: superAdmin.username,
        email: superAdmin.email,
      },
    };
  }

  /**
   * 申请管理员权限
   * @param body 包含目标用户ID和申请理由
   * @param request 当前请求
   * @returns 权限申请
   */
  @Post('request-admin-permission')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '申请管理员权限' })
  @ApiResponse({ status: 200, description: '权限申请创建成功' })
  async requestAdminPermission(
    @Body() body: { targetUserId: number; reason: string },
    @Request() req,
  ) {
    const permissionRequest = await this.adminService.requestAdminPermission(
      body.targetUserId,
      body.reason,
      req.user.id,
    );

    return {
      message: '权限申请创建成功',
      success: true,
      data: permissionRequest,
    };
  }

  /**
   * 批准管理员权限申请
   * @param requestId 申请ID
   * @param request 当前请求
   * @returns 更新后的申请
   */
  @Post('approve-admin-request/:requestId')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批准管理员权限申请' })
  @ApiResponse({ status: 200, description: '权限申请批准成功' })
  async approveAdminRequest(@Param('requestId') requestId: number, @Request() req) {
    const permissionRequest = await this.adminService.approveAdminRequest(requestId, req.user.id);

    return {
      message: '权限申请批准成功',
      success: true,
      data: permissionRequest,
    };
  }

  /**
   * 拒绝管理员权限申请
   * @param requestId 申请ID
   * @param body 包含拒绝理由
   * @param request 当前请求
   * @returns 更新后的申请
   */
  @Post('reject-admin-request/:requestId')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '拒绝管理员权限申请' })
  @ApiResponse({ status: 200, description: '权限申请拒绝成功' })
  async rejectAdminRequest(
    @Param('requestId') requestId: number,
    @Body() body: { rejectionReason: string },
    @Request() req,
  ) {
    const permissionRequest = await this.adminService.rejectAdminRequest(
      requestId,
      req.user.id,
      body.rejectionReason,
    );

    return {
      message: '权限申请拒绝成功',
      success: true,
      data: permissionRequest,
    };
  }

  /**
   * 获取待处理的权限申请
   * @returns 待处理的申请列表
   */
  @Get('pending-requests')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取待处理的权限申请' })
  @ApiResponse({ status: 200, description: '获取待处理申请成功' })
  async getPendingRequests() {
    const requests = await this.adminService.getPendingRequests();

    return {
      message: '获取待处理申请成功',
      success: true,
      data: requests,
    };
  }

  /**
   * 获取用户申请历史
   * @param userId 用户ID
   * @returns 申请历史
   */
  @Get('user-request-history/:userId')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户申请历史' })
  @ApiResponse({ status: 200, description: '获取申请历史成功' })
  async getUserRequestHistory(@Param('userId') userId: number) {
    const history = await this.adminService.getUserRequestHistory(userId);

    return {
      message: '获取申请历史成功',
      success: true,
      data: history,
    };
  }

  /**
   * 获取审计日志
   * @param page 页码
   * @param limit 每页数量
   * @param userId 用户ID（可选）
   * @param action 操作类型（可选）
   * @returns 审计日志
   */
  @Get('audit-logs')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取审计日志' })
  @ApiResponse({ status: 200, description: '获取审计日志成功' })
  async getAuditLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('userId') userId?: number,
    @Query('action') action?: AuditAction,
  ) {
    const result = await this.adminService.getAuditLogs(page, limit, userId, action);

    return {
      message: '获取审计日志成功',
      success: true,
      data: result.logs,
      total: result.total,
      page,
      limit,
    };
  }

  /**
   * 撤销管理员权限
   * @param body 包含目标用户ID和撤销理由
   * @param request 当前请求
   * @returns 权限申请
   */
  @Post('revoke-admin-permission')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '撤销管理员权限' })
  @ApiResponse({ status: 200, description: '撤销权限申请创建成功' })
  async revokeAdminPermission(
    @Body() body: { targetUserId: number; reason: string },
    @Request() req,
  ) {
    const permissionRequest = await this.adminService.revokeAdminPermission(
      body.targetUserId,
      body.reason,
      req.user.id,
    );

    return {
      message: '撤销权限申请创建成功',
      success: true,
      data: permissionRequest,
    };
  }

  /**
   * 获取所有管理员
   * @returns 管理员列表
   */
  @Get('admins')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有管理员' })
  @ApiResponse({ status: 200, description: '获取管理员列表成功' })
  async getAllAdmins() {
    const admins = await this.adminService.getAllAdmins();

    return {
      message: '获取管理员列表成功',
      success: true,
      data: admins,
    };
  }

  /**
   * 检查当前用户是否为超级管理员
   * @param request 当前请求
   * @returns 是否为超级管理员
   */
  @Get('is-super-admin')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '检查是否为超级管理员' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async isSuperAdmin(@Request() req) {
    const isSuperAdmin = await this.adminService.isSuperAdmin(req.user.id);

    return {
      message: '检查成功',
      success: true,
      data: { isSuperAdmin },
    };
  }

  /**
   * 检查当前用户是否为管理员
   * @param request 当前请求
   * @returns 是否为管理员
   */
  @Get('is-admin')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '检查是否为管理员' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async isAdmin(@Request() req) {
    const isAdmin = await this.adminService.isAdmin(req.user.id);

    return {
      message: '检查成功',
      success: true,
      data: { isAdmin },
    };
  }
}
