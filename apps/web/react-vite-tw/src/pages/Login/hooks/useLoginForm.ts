import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthType, LoginType, FormData, formDataSchema } from '../types';

/**
 * 登录表单
 */
export const useLoginForm = (authType: AuthType, loginType: LoginType) => {
  const defaultValues = useMemo(() => {
    if (authType === 'login') {
      if (loginType === 'account') {
        return {
          mode: 'account' as const,
          username: '',
          password: ''
        };
      } else {
        return {
          mode: 'email' as const,
          email: '',
          code: ''
        };
      }
    } else {
      return {
        mode: 'register' as const,
        username: '',
        password: ''
      };
    }
  }, [authType, loginType]);

  const form = useForm<FormData>({
    resolver: zodResolver(formDataSchema),
    defaultValues
  });

  // 重置表单
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return form;
};
