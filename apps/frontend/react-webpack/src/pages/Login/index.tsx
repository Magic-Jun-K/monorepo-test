import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/Toast';

import LoginTabs from './components/LoginTabs';
import FormInput from './components/FormInput';
import FormButton from './components/FormButton';
import RegisterText from './components/RegisterText';
import { encrypt } from '@/utils/hashWasm';
import * as api from '@/services';
import { AuthType, LoginType, FormData, loginSchema, phoneLoginSchema, registerSchema } from './types';
import { authStore } from '@/store/auth.store';
import { ToastProvider } from '@/components/Toast';

import styles from './index.module.scss';

// 创建 schema 映射关系
const schemaMap: Record<AuthType, any> = {
  login: {
    account: loginSchema,
    phone: phoneLoginSchema
  },
  register: registerSchema
};
const LoginContent = () => {
  const [authType, setAuthType] = useState<AuthType>('login');
  const [loginType, setLoginType] = useState<LoginType>('account');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(authType === 'login' ? schemaMap.login[loginType] : schemaMap.register),
    defaultValues: {
      username: '',
      phone: '',
      password: '',
      code: ''
    }
  });

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = form;

  const onSubmit = async (data: FormData) => {
    // console.log('测试onSubmit data', data);
    setLoading(true);
    const encryptedPassword = await encrypt(data.password);

    if (!encryptedPassword) return;

    try {
      if (loginType === 'phone' && !/^1[3-9]\d{9}$/.test(data.phone || '')) {
        addToast({ message: '请输入有效的手机号', type: 'error' });
        return;
      }

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

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        {authType === 'login' && <LoginTabs loginType={loginType} setLoginType={setLoginType} />}

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
                  name="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  rules={{
                    required: '手机号不能为空',
                    pattern: {
                      value: /^1[3-9]\d{9}$/,
                      message: '请输入有效的手机号'
                    }
                  }}
                  error={errors.phone}
                />

                <div className={styles.formGroup}>
                  <Controller
                    name="code"
                    control={control}
                    rules={{ required: '验证码不能为空' }}
                    render={({ field }) => (
                      <div className={styles.codeInput}>
                        <input {...field} type="text" placeholder="请输入验证码" className={errors.code ? styles.error : ''} />
                        <button type="button" className={styles.getCodeButton}>
                          获取验证码
                        </button>
                      </div>
                    )}
                  />
                  {errors.code && <span className={styles.errorMessage}>{errors.code.message}</span>}
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
              name="phone"
              type="tel"
              placeholder="请输入手机号"
              rules={{
                required: '手机号不能为空',
                pattern: {
                  value: /^1[3-9]\d{9}$/,
                  message: '请输入有效的手机号'
                }
              }}
              error={errors.phone}
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

        {loginType === 'account' ? <RegisterText authType={authType} setAuthType={setAuthType} /> : null}
      </div>
    </div>
  );
};

export default () => {
  return (
    <ToastProvider>
      <LoginContent />
    </ToastProvider>
  );
};
