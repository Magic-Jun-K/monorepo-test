import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Readable } from 'node:stream';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { RoleService } from '../../role/role.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { PermissionGuard } from '../../../common/guards/permission.guard';
import { AuthUser } from '../../auth/types/user.interface';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let roleService: RoleService;

  const mockUserService = {
    findAll:
      jest.fn<
        (
          query: Record<string, unknown>,
          currentUser: AuthUser,
        ) => Promise<{ list: unknown[]; total: number }>
      >(),
    create: jest.fn<(dto: CreateUserDto) => Promise<unknown>>(),
    update: jest.fn<(userId: number, dto: unknown) => Promise<unknown>>(),
    delete: jest.fn<(userId: number) => Promise<{ affected: number }>>(),
    importUsers:
      jest.fn<(file: Express.Multer.File) => Promise<{ imported: number; failed: number }>>(),
    exportUsers:
      jest.fn<(query: unknown, response: Response, currentUser: AuthUser) => Promise<void>>(),
    batchExportUsers:
      jest.fn<(userIds: number[], response: Response, currentUser: AuthUser) => Promise<void>>(),
    setSuperAdmin: jest.fn<(userId: number, isSuperAdmin: boolean) => Promise<unknown>>(),
    batchDelete: jest.fn<(userIds: number[]) => Promise<{ deleted: number; failed: number }>>(),
  };

  const mockRoleService = {
    batchAssignRolesToUser: jest.fn<(userId: number, roleIds: number[]) => Promise<void>>(),
    batchRemoveRolesFromUser: jest.fn<(userId: number, roleIds: number[]) => Promise<void>>(),
    getUserRoles: jest.fn<(userId: number) => Promise<unknown[]>>(),
  };

  const mockRequest = {
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      userType: 'USER',
      status: 'ACTIVE',
      isSuperAdmin: false,
    },
  };

  const mockResponse = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: RoleService,
          useValue: mockRoleService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    roleService = module.get<RoleService>(RoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return users with success response', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'user2@example.com' },
      ];
      const mockQuery = { page: 1, limit: 10 };
      const mockResult = { list: mockUsers, total: 2 };

      mockUserService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(mockQuery, mockRequest);

      expect(result).toEqual({
        success: true,
        data: mockResult,
      });
      expect(userService.findAll).toHaveBeenCalledWith(mockQuery, mockRequest.user);
    });

    it('should handle empty query', async () => {
      const mockResult = { list: [], total: 0 };
      mockUserService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(null, mockRequest);

      expect(result).toEqual({
        success: true,
        data: mockResult,
      });
      expect(userService.findAll).toHaveBeenCalledWith({}, mockRequest.user);
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        status: 'ACTIVE',
        isSuperAdmin: false,
      };
      const createdUser = { id: 3, ...createUserDto };

      mockUserService.create.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual({
        success: true,
        data: createdUser,
      });
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle creation error', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        status: 'ACTIVE',
        isSuperAdmin: false,
      };
      const errorMessage = '用户名已存在';

      mockUserService.create.mockRejectedValue(new Error(errorMessage));

      const result = await controller.create(createUserDto);

      expect(result).toEqual({
        success: false,
        message: errorMessage,
      });
      expect(userService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const userId = 1;
      const updateUserDto = { username: 'updateduser', email: 'updated@example.com' };
      const updatedUser = { id: userId, ...updateUserDto };

      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(result).toEqual({
        success: true,
        data: updatedUser,
      });
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      const userId = 1;
      const deleteResult = { affected: 1 };

      mockUserService.delete.mockResolvedValue(deleteResult);

      const result = await controller.delete(userId);

      expect(result).toEqual({
        success: true,
        data: deleteResult,
      });
      expect(userService.delete).toHaveBeenCalledWith(userId);
    });
  });

  describe('import', () => {
    it('should import users from file successfully', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'users.xlsx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        buffer: Buffer.from('test'),
        size: 1024,
        destination: '',
        filename: 'users.xlsx',
        path: '',
        stream: new Readable(),
      };
      const importResult = { imported: 5, failed: 0 };

      mockUserService.importUsers.mockResolvedValue(importResult);

      const result = await controller.import(mockFile);

      expect(result).toEqual({
        success: true,
        data: importResult,
      });
      expect(userService.importUsers).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('export', () => {
    it('should export users successfully', async () => {
      const mockQuery = { status: 'ACTIVE' };

      mockUserService.exportUsers.mockResolvedValue(undefined);

      await controller.export(mockQuery, mockResponse, mockRequest);

      expect(userService.exportUsers).toHaveBeenCalledWith(
        mockQuery,
        mockResponse,
        mockRequest.user,
      );
    });
  });

  describe('batchExport', () => {
    it('should batch export users successfully', async () => {
      const userIds = [1, 2, 3];

      mockUserService.batchExportUsers.mockResolvedValue(undefined);

      await controller.batchExport(userIds, mockResponse, mockRequest);

      expect(userService.batchExportUsers).toHaveBeenCalledWith(
        userIds,
        mockResponse,
        mockRequest.user,
      );
    });
  });

  describe('assignRoles', () => {
    it('should assign roles to user successfully', async () => {
      const userId = 1;
      const roleIds = [1, 2];

      mockRoleService.batchAssignRolesToUser.mockResolvedValue(undefined);

      const result = await controller.assignRoles(userId, roleIds);

      expect(result).toEqual({
        success: true,
        data: undefined,
      });
      expect(roleService.batchAssignRolesToUser).toHaveBeenCalledWith(userId, roleIds);
    });
  });

  describe('removeRoles', () => {
    it('should remove roles from user successfully', async () => {
      const userId = 1;
      const roleIds = [1, 2];

      mockRoleService.batchRemoveRolesFromUser.mockResolvedValue(undefined);

      const result = await controller.removeRoles(userId, roleIds);

      expect(result).toEqual({
        success: true,
        data: undefined,
      });
      expect(roleService.batchRemoveRolesFromUser).toHaveBeenCalledWith(userId, roleIds);
    });
  });

  describe('getUserRoles', () => {
    it('should get user roles successfully', async () => {
      const userId = 1;
      const userRoles = [
        { id: 1, name: 'admin', permissions: [] },
        { id: 2, name: 'user', permissions: [] },
      ];

      mockRoleService.getUserRoles.mockResolvedValue(userRoles);

      const result = await controller.getUserRoles(userId);

      expect(result).toEqual({
        success: true,
        data: userRoles,
      });
      expect(roleService.getUserRoles).toHaveBeenCalledWith(userId);
    });
  });

  describe('setSuperAdmin', () => {
    it('should set user as super admin successfully', async () => {
      const userId = 1;
      const isSuperAdmin = true;
      const updateResult = { id: userId, isSuperAdmin: true };

      mockUserService.setSuperAdmin.mockResolvedValue(updateResult);

      const result = await controller.setSuperAdmin(userId, isSuperAdmin);

      expect(result).toEqual({
        success: true,
        data: updateResult,
      });
      expect(userService.setSuperAdmin).toHaveBeenCalledWith(userId, isSuperAdmin);
    });
  });

  describe('batchDelete', () => {
    it('should batch delete users successfully', async () => {
      const userIds = [1, 2, 3];
      const deleteResult = { deleted: 3, failed: 0 };

      mockUserService.batchDelete.mockResolvedValue(deleteResult);

      const result = await controller.batchDelete(userIds);

      expect(result).toEqual({
        success: true,
        data: deleteResult,
      });
      expect(userService.batchDelete).toHaveBeenCalledWith(userIds);
    });
  });
});
