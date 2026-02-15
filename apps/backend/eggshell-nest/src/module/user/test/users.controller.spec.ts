import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { RoleService } from '../../role/role.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { PermissionGuard } from '../../../common/guards/permission.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let roleService: RoleService;

  const mockUserService = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    importUsers: jest.fn(),
    exportUsers: jest.fn(),
    batchExportUsers: jest.fn(),
    setSuperAdmin: jest.fn(),
    batchDelete: jest.fn(),
  };

  const mockRoleService = {
    batchAssignRolesToUser: jest.fn(),
    batchRemoveRolesFromUser: jest.fn(),
    getUserRoles: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
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

      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll(mockQuery, mockRequest);

      expect(result).toEqual({
        success: true,
        data: mockUsers,
      });
      expect(userService.findAll).toHaveBeenCalledWith(mockQuery, mockRequest.user);
    });

    it('should handle empty query', async () => {
      const mockUsers = [];
      mockUserService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll(null, mockRequest);

      expect(result).toEqual({
        success: true,
        data: mockUsers,
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
      const mockFile = { originalname: 'users.xlsx', buffer: Buffer.from('test') };
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
      const assignResult = { assigned: 2 };

      mockRoleService.batchAssignRolesToUser.mockResolvedValue(assignResult);

      const result = await controller.assignRoles(userId, roleIds);

      expect(result).toEqual({
        success: true,
        data: assignResult,
      });
      expect(roleService.batchAssignRolesToUser).toHaveBeenCalledWith(userId, roleIds);
    });
  });

  describe('removeRoles', () => {
    it('should remove roles from user successfully', async () => {
      const userId = 1;
      const roleIds = [1, 2];
      const removeResult = { removed: 2 };

      mockRoleService.batchRemoveRolesFromUser.mockResolvedValue(removeResult);

      const result = await controller.removeRoles(userId, roleIds);

      expect(result).toEqual({
        success: true,
        data: removeResult,
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
