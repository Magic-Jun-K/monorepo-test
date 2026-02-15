export interface AuthRole {
  id: number;
  name: string;
  code: string;
  type: string;
  level: number;
  isSuperAdmin: boolean;
  description?: string;
}

export interface AuthUser {
  id: number;
  username: string;
  userType: string;
  status: string;
  isSuperAdmin: boolean;
  roles?: AuthRole[];
  // 根据需要添加其他属性，例如：
  email?: string;
  phone?: string;
}
