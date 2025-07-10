class AuthStore {
  private accessToken: string | null = null; // 存储在sessionStorage

  // 初始化时尝试读取存储
  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = sessionStorage.getItem('access_token');
    }
  }

  // 检查是否已登录
  getAccessToken() {
    return this.accessToken;
  }
  // 登录成功后设置token
  setTokens(access: string) {
    this.accessToken = access;
    sessionStorage.setItem('access_token', access);
  }

  clear() {
    this.accessToken = null;
    sessionStorage.removeItem('access_token');
  }
}
export const authStore = new AuthStore();
