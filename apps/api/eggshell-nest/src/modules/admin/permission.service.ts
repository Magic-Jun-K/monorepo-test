/**
 * 权限管理服务
 */
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditLogEntity, AuditAction } from './entities/audit-log.entity';
import {
  PermissionRequestEntity,
  RequestStatus,
  RequestType,
} from '../permission/entities/permission-request.entity';
import { UserEntity, UserType } from '../user/entities/user.entity';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(PermissionRequestEntity)
    private permissionRequestRepository: Repository<PermissionRequestEntity>,
    @InjectRepository(AuditLogEntity)
    private auditLogRepository: Repository<AuditLogEntity>,
  ) {}

  /**
   * 创建权限申请
   */
  async createPermissionRequest(
    requestType: RequestType,
    targetUserId: number,
    reason: string,
    requestedById: number,
    details?: Record<string, unknown>,
  ): Promise<PermissionRequestEntity> {
    // 检查目标用户是否存在
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('目标用户不存在');
    }

    // 检查申请人是否存在
    const requestedBy = await this.userRepository.findOne({
      where: { id: requestedById },
    });

    if (!requestedBy) {
      throw new NotFoundException('申请人不存在');
    }

    // 检查是否已有待处理的相同申请
    const existingRequest = await this.permissionRequestRepository.findOne({
      where: {
        targetUserId,
        requestType,
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('已存在待处理的相同申请');
    }

    // 创建权限申请
    const permissionRequest = this.permissionRequestRepository.create({
      requestType,
      targetUserId,
      reason,
      requestedById,
      details,
      status: RequestStatus.PENDING,
    });

    const savedRequest = await this.permissionRequestRepository.save(permissionRequest);

    // 记录审计日志
    await this.auditLogRepository.save({
      action: AuditAction.PERMISSION_REQUEST,
      description: `创建权限申请: ${requestType} for user ${targetUserId}`,
      details: {
        requestId: savedRequest.id,
        requestType,
        targetUserId,
        reason,
      },
      userId: requestedById,
      targetUserId,
      success: true,
    });

    return savedRequest;
  }

  /**
   * 审批权限申请
   */
  async approvePermissionRequest(
    requestId: number,
    approvedById: number, // Used for audit logging and permission validation
    approve: boolean,
    rejectionReason?: string,
  ): Promise<PermissionRequestEntity> {
    // 查找权限申请
    const permissionRequest = await this.permissionRequestRepository.findOne({
      where: { id: requestId },
      relations: ['targetUser', 'requestedBy'],
    });

    if (!permissionRequest) {
      throw new NotFoundException('权限申请不存在');
    }

    if (permissionRequest.status !== RequestStatus.PENDING) {
      throw new BadRequestException('该申请已处理');
    }

    // 查找审批人
    const approvedBy = await this.userRepository.findOne({
      where: { id: approvedById },
    });

    if (!approvedBy) {
      throw new NotFoundException('审批人不存在');
    }

    // 更新申请状态
    permissionRequest.status = approve ? RequestStatus.APPROVED : RequestStatus.REJECTED;
    permissionRequest.approvedById = approvedById;
    permissionRequest.approvedAt = new Date();

    if (!approve && rejectionReason) {
      permissionRequest.rejectionReason = rejectionReason;
    }

    const updatedRequest = await this.permissionRequestRepository.save(permissionRequest);

    // 如果批准，执行相应的权限变更
    if (approve) {
      await this.executePermissionChange(permissionRequest, approvedById);
    }

    // 记录审计日志
    await this.auditLogRepository.save({
      action: AuditAction.PERMISSION_APPROVAL,
      description: `${approve ? '批准' : '拒绝'}权限申请: ${permissionRequest.requestType} for user ${permissionRequest.targetUserId}`,
      details: {
        requestId,
        requestType: permissionRequest.requestType,
        targetUserId: permissionRequest.targetUserId,
        approved: approve,
        rejectionReason,
      },
      userId: approvedById,
      targetUserId: permissionRequest.targetUserId,
      success: true,
    });

    return updatedRequest;
  }

  /**
   * 执行权限变更
   * @param permissionRequest 权限申请实体
   * @param approvedById 审批人ID
   */
  private async executePermissionChange(
    permissionRequest: PermissionRequestEntity,
    approvedById: number,
  ): Promise<void> {
    this.logger.log(`执行权限变更，审批人ID: ${approvedById}`);
    const { requestType, targetUser } = permissionRequest;

    switch (requestType) {
      case RequestType.PROMOTE_TO_ADMIN:
        if (targetUser.userType === UserType.INTERNAL) {
          throw new BadRequestException('用户已经是管理员');
        }
        targetUser.userType = UserType.INTERNAL;
        break;

      case RequestType.DEMOTE_FROM_ADMIN:
        if (targetUser.userType !== UserType.INTERNAL) {
          throw new BadRequestException('用户不是管理员');
        }
        targetUser.userType = UserType.EXTERNAL;
        break;

      case RequestType.SYSTEM_ACCESS:
        // 系统访问权限处理逻辑
        break;

      default:
        throw new BadRequestException('未知的权限类型');
    }

    await this.userRepository.save(targetUser);
  }

  /**
   * 获取待处理的权限申请列表
   */
  async getPendingRequests(): Promise<PermissionRequestEntity[]> {
    return this.permissionRequestRepository.find({
      where: { status: RequestStatus.PENDING },
      relations: ['targetUser', 'requestedBy'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * 获取用户的历史申请记录
   */
  async getUserRequestHistory(userId: number): Promise<PermissionRequestEntity[]> {
    return this.permissionRequestRepository.find({
      where: [{ requestedById: userId }, { targetUserId: userId }],
      relations: ['targetUser', 'requestedBy', 'approvedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 获取审计日志
   */
  async getAuditLogs(
    page: number = 1,
    limit: number = 20,
    userId?: number,
    action?: AuditAction,
  ): Promise<{ logs: AuditLogEntity[]; total: number }> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user')
      .leftJoinAndSelect('log.targetUser', 'targetUser')
      .orderBy('log.createdAt', 'DESC');

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId OR log.targetUserId = :userId', { userId });
    }

    if (action) {
      queryBuilder.andWhere('log.action = :action', { action });
    }

    const total = await queryBuilder.getCount();
    const logs = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { logs, total };
  }
}
