import { Control, FieldError, FieldValues, Path } from 'react-hook-form';
import { z } from 'zod';

export type AuthType = 'login' | 'register';
export type LoginType = 'account' | 'email';

// 账号登录校验规则
export const loginAccountSchema = z.object({
  mode: z.literal('account'),
  username: z.string().min(2, '用户名至少2个字符'),
  password: z.string().min(6, '密码至少6个字符')
  // remember: z.boolean().optional()
});

// 邮箱登录校验规则
export const loginEmailSchema = z.object({
  mode: z.literal('email'),
  email: z.email('请输入有效的邮箱地址'),
  code: z.string().length(6, '验证码必须为6位数字')
});

// 注册账号校验规则
export const registerSchema = z.object({
  mode: z.literal('register'),
  username: z.string().min(2, '用户名至少2个字符'),
  // phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),
  // email: z.email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符')
});

// 定义联合 schema
// export const formDataSchema = z.union([loginAccountSchema, loginEmailSchema, registerSchema]);
export const formDataSchema = z.discriminatedUnion('mode', [
  loginAccountSchema,
  loginEmailSchema,
  registerSchema
]);

// 可选：添加 discriminant 字段以帮助类型推断
export const formDataSchemaWithDiscriminant = z.discriminatedUnion('mode', [
  loginAccountSchema.extend({ mode: z.literal('account') }),
  loginEmailSchema.extend({ mode: z.literal('email') }),
  registerSchema.extend({ mode: z.literal('register') })
]);

// 联合类型定义不同场景
export type FormData = z.infer<typeof formDataSchema>;

// 表单组件属性
export type FormInputProps<T extends FieldValues = FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  type: string;
  placeholder: string;
  rules?: unknown;
  error?: FieldError;
};

export type LoginFormData = z.infer<typeof loginAccountSchema>;
export type EmailLoginFormData = z.infer<typeof loginEmailSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
// 类型守卫，用于判断是否为登录表单数据
export function isAccountOrRegister(data: FormData): data is LoginFormData | RegisterFormData {
  return data.mode === 'account' || data.mode === 'register';
}

// 登录响应数据
export interface AuthResponse {
  // success: boolean;
  // data?: {
  //   access_token: string;
  // };
  // message?: string;
  success: boolean;
  message?: string;
  data?: string;
}

export type AccountFormError = { username?: FieldError; password?: FieldError };
export type EmailFormError = { email?: FieldError; code?: FieldError };
export type FormErrors = AccountFormError | EmailFormError;
