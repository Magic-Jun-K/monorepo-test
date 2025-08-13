export interface AuthRole {
  id: number;
  name: string;
  description?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  userType: string;
  isActive: boolean;
  roles?: AuthRole[];
  // 根据需要添加其他属性，例如：
  email?: string;
  phone?: string;
}
