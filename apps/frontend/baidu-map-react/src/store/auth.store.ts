class AuthStore {
  private accessToken: string | null = null; // 存储在sessionStorage
  private refreshToken: string | null = null; // 存储在localStorage

  // 初始化时尝试读取存储
  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = sessionStorage.getItem('access_token');
      this.refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
    }
  }

  // 检查是否已登录
  getAccessToken() {
    return this.accessToken;
  }

  // 检查是否已登录
  getRefreshToken() {
    return this.refreshToken;
  }

  // 登录成功后设置token
  setTokens(access: string, refresh: string, rememberMe = false) {
    this.accessToken = access;
    this.refreshToken = refresh;

    sessionStorage.setItem('access_token', access);
    if (rememberMe) {
      localStorage.setItem('refresh_token', refresh);
    } else {
      sessionStorage.setItem('refresh_token', refresh);
    }
  }

  clear() {
    this.accessToken = null;
    this.refreshToken = null;
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    localStorage.removeItem('refresh_token');
  }
}
export const authStore = new AuthStore();
