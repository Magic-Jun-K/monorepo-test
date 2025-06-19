import { useEffect } from 'react';
import { decodeJwt } from 'jose';

import { authStore } from '@/store/auth.store';
import { refreshToken } from '@/services/auth';

// 时间常量
const TIME_CONSTANTS = {
  ONE_DAY: 24 * 3600 * 1000, // 1天
  ONE_HOUR: 3600 * 1000, // 1小时
  FIVE_MINUTES: 5 * 60 * 1000, // 5分钟
  FIVE_SECONDS: 5000, // 5秒
  ONE_SECOND: 1000 // 1秒
} as const;

interface TokenPayload {
  exp: number;
  [key: string]: any;
}

interface TokenError extends Error {
  code?: string;
  status?: number;
}

const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
};

/**
 * 监控 token 过期并自动处理的 hook
 *
 * 功能：
 * 1. 定期检查 token 是否过期
 * 2. 在用户活跃时立即检查
 * 3. 自动刷新过期的 token
 * 4. 处理 token 刷新失败的情况
 *
 * 检测策略：
 * - 超过1天：每小时检查
 * - 超过1小时：每5分钟检查
 * - 最后5秒：每秒检查
 *
 * @returns void
 */
export const useTokenExpirationCheck = (): void => {
  useEffect(() => {
    let checkTimer: NodeJS.Timeout;
    const eventTypes = ['click', 'mousemove', 'keydown'];

    // 错误处理
    const handleError = (error: unknown) => {
      console.error('Token检查出错:', error);
      authStore.clear();
    };

    // 检查 token 是否过期
    const checkTokenExpiration = async (exp: number) => {
      if (exp * 1000 < Date.now()) {
        try {
          // 尝试刷新 token
          // const { data } = await axios
          //   .post(
          //     'api/auth/refresh',
          //     {},
          //     {
          //       withCredentials: true,
          //       baseURL: '' // 确保使用完整路径
          //     }
          //   )
          //   .then(res => res.data);
          const res = await refreshToken();
          authStore.setTokens(res.data);
          return true;
        } catch (error) {
          const tokenError = error as TokenError;
          console.error('Token刷新失败:', {
            message: tokenError.message,
            code: tokenError.code,
            status: tokenError.status
          });
          authStore.clear();
          return false;
        }
      }
      return true;
    };

    // 计划检查
    const scheduleCheck = (immediate = false) => {
      clearTimeout(checkTimer);

      const accessToken = authStore.getAccessToken();
      if (!accessToken) return;

      try {
        const { exp } = decodeJwt(accessToken) as TokenPayload;
        if (!exp) {
          authStore.clear();
          return;
        }

        const remaining = exp * 1000 - Date.now();

        // 计算下一次检查时间
        const nextCheck =
          remaining > TIME_CONSTANTS.ONE_DAY
            ? TIME_CONSTANTS.ONE_HOUR
            : remaining > TIME_CONSTANTS.ONE_HOUR
            ? TIME_CONSTANTS.FIVE_MINUTES
            : Math.max(remaining - TIME_CONSTANTS.FIVE_SECONDS, TIME_CONSTANTS.ONE_SECOND);

        checkTimer = setTimeout(
          async () => {
            const isValid = await checkTokenExpiration(exp);
            if (isValid) {
              scheduleCheck();
            }
          },
          immediate ? 0 : nextCheck
        );
      } catch (error) {
        handleError(error);
      }
    };

    // 监听用户活动
    const onUserActive = debounce(() => scheduleCheck(true), 1000);
    // 添加事件监听器
    eventTypes.forEach(e => window.addEventListener(e, onUserActive));

    scheduleCheck(); // 初始检查

    // 清理资源
    const cleanup = () => {
      clearTimeout(checkTimer);
      eventTypes.forEach(e => window.removeEventListener(e, onUserActive));
    };

    return cleanup;
  }, []);
};
