import { z } from 'zod';

export type AuthType = 'login' | 'register';
export type LoginType = 'account' | 'phone';

// 登录模式校验规则
export const loginSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符'),
  password: z.string().min(6, '密码至少6个字符'),
  remember: z.boolean().optional()
});

// 手机登录校验规则
export const phoneLoginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  code: z.string().length(6, '验证码必须为6位数字'),
  remember: z.boolean().optional()
});

// 注册模式校验规则
export const registerSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'), 
  password: z.string().min(6, '密码至少6个字符')
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type PhoneLoginFormData = z.infer<typeof phoneLoginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// 联合类型定义不同场景
export type FormData = (LoginFormData & PhoneLoginFormData & RegisterFormData) & {
  username?: string;
  phone?: string;
  password: string;
  code?: string;
  remember?: boolean;
};

export type FormErrors = {
  username?: { message: string };
  password?: { message: string };
  phone?: { message: string };
  code?: { message: string };
  confirmPassword?: { message: string };
  remember?: { message: string };
};

export type FormInputProps = {
  control: any;
  name: string;
  type: string;
  placeholder: string;
  rules?: Record<string, any>;
  error?: { message: string };
};

export interface LoginRes {
  token: string;
  userInfo: UserInfo;
  success: boolean;
}

export interface UserInfo {
  username: string;
}
