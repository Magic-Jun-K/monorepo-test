/**
 * 认证状态管理
 * 负责token认证相关功能
 */
class AuthStore {
  private accessToken: string | null = null;

  // 登录成功后设置token
  setToken(access: string) {
    this.accessToken = access;
  }

  // 检查是否已登录
  getAccessToken() {
    return this.accessToken;
  }

  clear() {
    this.accessToken = null;
  }
}
export const authStore = new AuthStore(); // 单例实例