/**
 * 用户状态管理
 * 负责用户信息和权限管理
 */
class UserStore {
  private currentUser: any = null; // 存储当前用户信息
  private userRoles: string[] = []; // 存储用户角色
  private isAdmin: boolean = false; // 缓存是否是管理员

  /**
   * 设置用户信息
   */
  setCurrentUser(user: any) {
    this.currentUser = user;
    if (user?.roles) {
      this.userRoles = user.roles.map((role: any) => role.code);
      this.isAdmin = this.userRoles.some(role => 
        role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'USER_MANAGER'
      );
    } else {
      this.userRoles = [];
      this.isAdmin = false;
    }
  }

  /**
   * 获取用户信息
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * 获取用户角色
   */
  getUserRoles() {
    return this.userRoles;
  }

  /**
   * 检查是否是管理员
   */
  getIsAdmin() {
    return this.isAdmin;
  }

  /**
   * 检查用户是否有特定角色
   */
  hasRole(roleCode: string): boolean {
    return this.userRoles.includes(roleCode);
  }

  /**
   * 检查用户是否有任意一个指定角色
   */
  hasAnyRole(roleCodes: string[]): boolean {
    return roleCodes.some(role => this.userRoles.includes(role));
  }

  /**
   * 清除用户信息（退出登录时调用）
   */
  clear() {
    this.currentUser = null;
    this.userRoles = [];
    this.isAdmin = false;
  }
}
export const userStore = new UserStore(); // 单例实例