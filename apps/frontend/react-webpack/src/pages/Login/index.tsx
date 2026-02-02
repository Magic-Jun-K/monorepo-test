import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, FieldError } from 'react-hook-form';

import LoginTabs from './components/LoginTabs';
import FormInput from './components/FormInput';
import FormButton from './components/FormButton';
import RegisterText from './components/RegisterText';

import { useToast } from '@/components/Toast/useToast';
import { ToastProvider } from '@/components/Toast';
import { BASE_URL } from '@/config';
import { emailLogin, /* login, register, */ sendCode } from '@/services';
import { useAuthStore } from '@/stores/zustand/auth.store';
import { initAuth, encryptedLogin, encryptedRegister } from '@/utils/hashEncrypt';
import { useLoginForm } from './hooks/useLoginForm';
import {
  AuthType,
  LoginType,
  FormData,
  LoginFormData,
  RegisterFormData,
  EmailLoginFormData,
  isAccountOrRegister,
  AuthResponse,
} from './types';

import styles from './index.module.scss';

const backgroundImageUrl = `${BASE_URL}/compressed/login-bg2.webp`;
// const api = { login, register };

interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
      detail?: string;
    };
  };
  message?: string;
}

const LoginContent = () => {
  const [authType, setAuthType] = useState<AuthType>('login'); // 登录注册
  const [loginType, setLoginType] = useState<LoginType>('account'); // 登录方式
  const [loading, setLoading] = useState<boolean>(false); // 登录中
  const [isSending, setIsSending] = useState<boolean>(false); // 验证码发送中
  const [countdown, setCountdown] = useState<number>(0); // 倒计时
  const navigate = useNavigate();
  const { addToast } = useToast();

  const form = useLoginForm(authType, loginType);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  // 初始化加密密钥
  useEffect(() => {
    initAuth().catch(err => console.error('初始化认证失败:', err));
  }, []);

  // 获取表单字段错误信息
  const getFieldError = (fieldName: string): FieldError | undefined => {
    if (loginType === 'account' || authType === 'register') {
      return errors[fieldName as keyof typeof errors] as FieldError | undefined;
    } else if (loginType === 'email') {
      return errors[fieldName as keyof typeof errors] as FieldError | undefined;
    }
    return undefined;
  };

  // 验证码按钮倒计时管理
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && isSending) {
      setIsSending(false);
    }
    return () => clearInterval(timer);
  }, [countdown, isSending]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      let response: AuthResponse;

      // 类型守卫
      if (isAccountOrRegister(data)) {
        response = await handleAccountOrRegister(data); // 此时 data 类型为 LoginFormData | RegisterFormData
      } else {
        response = await handleEmailLogin(data); // 此时 data 类型为 EmailLoginFormData
      }

      // Handle successful response(处理成功响应)
      if (response.success) {
        // 注册成功后切换到登录模式并显示成功消息
        if (authType === 'register') {
          addToast({ message: response.message || '注册成功，请登录', type: 'success' });
          setAuthType('login');
        } else {
          // 登录成功需要data字段作为token
          if (!response.data) {
            throw new Error('Authentication data is missing');
          }
          useAuthStore.getState().setToken(response.data);

          navigate('/');
        }
      } else {
        addToast({ message: response.message || 'Login fail', type: 'error' });
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const err = error as ErrorResponse;
      if (err.response) {
        // Handle structured error response(处理结构化错误响应)
        const { status, data } = err.response;
        if (status === 403) {
          addToast({ message: '访问被拒绝，请检查您的权限', type: 'error' });
        } else {
          const { message, detail } = data || {};
          addToast({ message: message || detail || `请求失败，状态码：${status}`, type: 'error' });
        }
      } else if (err.message) {
        // Handle generic error(处理一般错误)
        addToast({ message: err.message, type: 'error' });
      } else {
        addToast({ message: '登录失败，请稍后重试', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  // 公共密码处理
  const handleAccountOrRegister = async (
    data: LoginFormData | RegisterFormData,
  ): Promise<AuthResponse> => {
    if (authType === 'login') {
      return await encryptedLogin(data.username, data.password);
    } else {
      return await encryptedRegister(data.username, data.password);
    }
  };

  // 邮箱登录专用
  const handleEmailLogin = async (data: EmailLoginFormData): Promise<AuthResponse> => {
    return await emailLogin({ email: data.email, code: data.code });
  };

  const handleSendCode = () => {
    if (countdown > 0) return; // 防止重复点击

    const email = form.getValues('email');

    if (!email) {
      form.setError('email', { message: '请输入邮箱' });
      return;
    }

    setIsSending(true);
    setCountdown(60); // 设置倒计时60秒

    // 调用发送验证码接口
    // fetch(`api/auth/send-code?email=${form.getValues('email')}`, { method: 'POST' })
    //   .then(() => {
    //     addToast({ message: '验证码已发送，请查收邮箱', type: 'success' });
    //   })
    // .catch(() => {
    //   addToast({ message: '验证码发送失败，请稍后重试', type: 'error' });
    //   setCountdown(0);
    // });

    sendCode(email)
      .then(() => {
        addToast({ message: '验证码已发送，请查收邮箱', type: 'success' });
      })
      .catch(() => {
        addToast({ message: '验证码发送失败，请稍后重试', type: 'error' });
        setCountdown(0);
      });
  };

  return (
    <div
      className="flex justify-end items-center min-h-screen pr-[18vw] bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      <div className="w-120 min-h-87 p-8 bg-white rounded-xl shadow-[0_4px_20px_rgba(94,91,91,0.1)]">
        {/* {authType === 'login' && <LoginTabs loginType={loginType} setLoginType={setLoginType} />} */}
        <LoginTabs authType={authType} loginType={loginType} setLoginType={setLoginType} />

        {authType === 'login' ? (
          <>
            {/* 账号登录 */}
            {loginType === 'account' ? (
              <form
                key={`${authType}-${loginType}`} // 强制重新挂载
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(onSubmit)}
              >
                <FormInput
                  control={control}
                  name="username"
                  type="text"
                  placeholder="请输入用户名"
                  rules={{ required: '用户名不能为空' }}
                  // error={errors.username}
                  error={getFieldError('username')}
                />
                <FormInput
                  control={control}
                  name="password"
                  type="password"
                  placeholder="请输入密码"
                  rules={{ required: '密码不能为空' }}
                  // error={errors.password}
                  error={getFieldError('password')}
                />
                {/* 密码强度提示 */}
                {/* {passwordStrength > 0 && (
                  <div className={styles.passwordStrength}>
                    <div
                      className={`${styles.strengthBar} ${getStrengthClass(passwordStrength)}`}
                    />
                  </div>
                )} */}
                <FormButton loading={loading}>{loading ? '登录中...' : '登录'}</FormButton>
              </form>
            ) : (
              /* 邮箱登录 */
              <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <FormInput
                  control={control}
                  name="email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  rules={{
                    required: '邮箱地址不能为空',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: '请输入有效的邮箱地址',
                    },
                  }}
                  error={getFieldError('email')}
                />
                <div className={styles.formGroup}>
                  <Controller
                    name="code"
                    control={control}
                    defaultValue="" // 添加默认值
                    rules={{
                      required: '验证码不能为空',
                      pattern: {
                        value: /^\d{6}$/,
                        message: '验证码必须为6位数字',
                      },
                    }}
                    render={({ field }) => (
                      <div className={styles.codeInput}>
                        <input
                          {...field}
                          type="text"
                          placeholder="请输入验证码"
                          className={getFieldError('code') ? styles.error : ''}
                        />
                        <button
                          type="button"
                          className={styles.getCodeButton}
                          onClick={handleSendCode}
                          disabled={isSending}
                        >
                          {isSending ? `重新发送(${countdown}s)` : '获取验证码'}
                        </button>
                      </div>
                    )}
                  />
                  {getFieldError('code') && (
                    <span className={styles.errorMessage}>{getFieldError('code')?.message}</span>
                  )}
                </div>
                <FormButton loading={loading}>{loading ? '登录中...' : '登录'}</FormButton>
              </form>
            )}
          </>
        ) : (
          /* 账号注册 */
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              control={control}
              name="username"
              type="text"
              placeholder="请输入用户名"
              rules={{ required: '用户名不能为空' }}
              error={getFieldError('username')}
            />
            <FormInput
              control={control}
              name="password"
              type="password"
              placeholder="请输入密码"
              rules={{ required: '密码不能为空' }}
              error={getFieldError('password')}
            />

            <FormButton loading={loading}>{loading ? '注册中...' : '注册'}</FormButton>
          </form>
        )}

        {loginType === 'account' ? (
          <RegisterText authType={authType} setAuthType={setAuthType} />
        ) : null}
      </div>
    </div>
  );
};

const FooterRecord = memo(() => {
  return (
    <a
      className={styles['footer-record']}
      href="https://beian.miit.gov.cn"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>粤ICP备2025421349号-1</span>
    </a>
  );
});

export default () => {
  return (
    <ToastProvider>
      <LoginContent />
      <FooterRecord />
    </ToastProvider>
  );
};
