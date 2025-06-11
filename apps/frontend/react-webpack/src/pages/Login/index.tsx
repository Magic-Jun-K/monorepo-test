import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, FieldError } from 'react-hook-form';

import { useToast } from '@/components/Toast';
import LoginTabs from './components/LoginTabs';
import FormInput from './components/FormInput';
import FormButton from './components/FormButton';
import RegisterText from './components/RegisterText';
import { encrypt } from '@/utils/hashWasm';
import { emailLogin, login, register, sendCode } from '@/services';
import {
  AuthType,
  LoginType,
  FormData,
  LoginFormData,
  RegisterFormData,
  EmailLoginFormData,
  isAccountOrRegister,
  AuthResponse
} from './types';
import { authStore } from '@/store/auth.store';
import { ToastProvider } from '@/components/Toast';
import { BASE_URL } from '@/config';
import { useLoginForm } from './hooks/useLoginForm';

import styles from './index.module.scss';

const backgroundImageUrl = `${BASE_URL}/compressed/login-bg2.webp`;
const api = { login, register };

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
    formState: { errors }
  } = form;

  // 获取表单字段错误信息
  const getFieldError = (fieldName: string) => {
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
        setCountdown(prev => prev - 1);
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

      if (response.success) {
        authStore.setTokens(response.data!.access_token, response.data!.refresh_token);
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response) {
        // Handle structured error response(处理结构化错误响应)
        const { status, data } = error.response;
        if (status === 403) {
          addToast({ message: '访问被拒绝，请检查您的权限', type: 'error' });
        } else {
          const { message, detail } = data || {};
          addToast({ message: message || detail || `请求失败，状态码：${status}`, type: 'error' });
        }
      } else if (error.message) {
        // Handle generic error(处理一般错误)
        addToast({ message: error.message, type: 'error' });
      } else {
        addToast({ message: '登录失败，请稍后重试', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  // 公共密码处理
  const handleAccountOrRegister = async (
    data: LoginFormData | RegisterFormData
  ): Promise<AuthResponse> => {
    const encryptedPassword = await encrypt(data.password);
    return await api[authType]({
      username: data.username,
      password: encryptedPassword
    });
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
      className={styles.loginContainer}
      style={{
        background: `url(${backgroundImageUrl})`,
        backgroundSize: 'cover', // 根据需要添加其他背景样式
        backgroundRepeat: 'no-repeat' // 根据需要添加其他背景样式
        // background-position: 'left'; // 根据需要添加其他背景样式
      }}
    >
      <div className={styles.loginBox}>
        {/* {authType === 'login' && <LoginTabs loginType={loginType} setLoginType={setLoginType} />} */}
        <LoginTabs authType={authType} loginType={loginType} setLoginType={setLoginType} />

        {authType === 'login' ? (
          <>
            {/* 账号登录 */}
            {loginType === 'account' ? (
              <form
                key={`${authType}-${loginType}`} // 强制重新挂载
                className={styles.form}
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
              <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <FormInput
                  control={control}
                  name="email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  rules={{
                    required: '邮箱地址不能为空',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: '请输入有效的邮箱地址'
                    }
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
                        message: '验证码必须为6位数字'
                      }
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
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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
    <div
      className={styles['footer-record']}
      onClick={() => {
        window.open('https://beian.miit.gov.cn');
      }}
    >
      <span>粤ICP备2025421349号-1</span>
    </div>
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
