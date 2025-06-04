import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useToast } from '@/components/Toast';
import LoginTabs from './components/LoginTabs';
import FormInput from './components/FormInput';
import FormButton from './components/FormButton';
import RegisterText from './components/RegisterText';
import { encrypt } from '@/utils/hashWasm';
import { login, register } from '@/services';
import {
  AuthType,
  LoginType,
  FormData,
  loginSchema,
  emailLoginSchema,
  registerSchema
} from './types';
import { authStore } from '@/store/auth.store';
import { ToastProvider } from '@/components/Toast';
import { BASE_URL } from '@/config';

import styles from './index.module.scss';

const backgroundImageUrl = `${BASE_URL}/compressed/login-bg2.webp`;

// 创建 schema 映射关系
const schemaMap: Record<AuthType, any> = {
  login: {
    account: loginSchema,
    email: emailLoginSchema
  },
  register: registerSchema
};
const api = { login, register };
const LoginContent = () => {
  const [authType, setAuthType] = useState<AuthType>('login'); // 登录注册
  const [loginType, setLoginType] = useState<LoginType>('account'); // 登录方式
  const [loading, setLoading] = useState<boolean>(false); // 登录中
  const [isSending, setIsSending] = useState<boolean>(false); // 验证码发送中
  const [countdown, setCountdown] = useState<number>(0); // 倒计时
  const navigate = useNavigate();
  const { addToast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(authType === 'login' ? schemaMap.login[loginType] : schemaMap.register),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      code: ''
    }
  });

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = form;

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
    const encryptedPassword = await encrypt(data.password);

    if (!encryptedPassword) return;

    try {
      const res: any = await api[authType]({ ...data, password: encryptedPassword });
      // console.log('测试onSubmit response', res);

      // Handle successful response(处理成功响应)
      if (res.success) {
        if (authType === 'login') {
          // console.log('测试登录onSubmit res.data', res.data);
          authStore.setTokens(res.data.access_token, res.data.refresh_token);

          const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/';
          navigate(redirectUrl);
        } else {
          addToast({ message: '注册成功，请登录', type: 'success' });
          setAuthType('login');
        }
      } else {
        addToast({ message: res.message || '登录失败，请稍后重试', type: 'error' });
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

  const handleSendCode = () => {
    if (countdown > 0) return; // 防止重复点击

    setIsSending(true);
    setCountdown(60); // 设置倒计时60秒

    // 调用发送验证码接口
    // fetch(`/auth/send-code?email=${form.getValues('email')}`)
    //   .then(() => {
    //     addToast({ message: '验证码已发送，请查收邮箱' });
    //   })
    //   .catch(() => {
    //     addToast({ message: '验证码发送失败，请稍后重试' });
    //     setCountdown(0);
    //   });
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
            {loginType === 'account' ? (
              <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <FormInput
                  control={control}
                  name="username"
                  type="text"
                  placeholder="请输入用户名"
                  rules={{ required: '用户名不能为空' }}
                  error={errors.username}
                />
                <FormInput
                  control={control}
                  name="password"
                  type="password"
                  placeholder="请输入密码"
                  rules={{ required: '密码不能为空' }}
                  error={errors.password}
                />
                <FormButton loading={loading}>{loading ? '登录中...' : '登录'}</FormButton>
              </form>
            ) : (
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
                  error={errors.email}
                />
                <div className={styles.formGroup}>
                  {/* @ts-expect-error Controller 组件类型定义不兼容本用法 */}
                  <Controller
                    name="code"
                    control={control}
                    rules={{ required: '验证码不能为空' }}
                    render={({ field }) => (
                      <div className={styles.codeInput}>
                        <input
                          {...field}
                          type="text"
                          placeholder="请输入验证码"
                          className={errors.code ? styles.error : ''}
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
                  {errors.code && (
                    <span className={styles.errorMessage}>{errors.code.message}</span>
                  )}
                </div>
                <FormButton loading={loading}>{loading ? '登录中...' : '登录'}</FormButton>
              </form>
            )}
          </>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              control={control}
              name="username"
              type="text"
              placeholder="请输入用户名"
              rules={{ required: '用户名不能为空' }}
              error={errors.username}
            />
            <FormInput
              control={control}
              name="password"
              type="password"
              placeholder="请输入密码"
              rules={{ required: '密码不能为空' }}
              error={errors.password}
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
