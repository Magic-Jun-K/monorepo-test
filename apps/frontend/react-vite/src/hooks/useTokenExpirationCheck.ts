import { useEffect, useRef } from 'react';
import { decodeJwt } from 'jose';

import { authStore } from '@/store/auth.store';
import { request } from '@/utils/request';

/**
 * 监控 token 过期并自动处理的 hook
 * @returns void
 */
export const useTokenExpirationCheck = (): void => {
  // 添加一个刷新中的标志
  const isRefreshing = useRef(false);

  useEffect(() => {
    let checkTimer: NodeJS.Timeout;
    const eventTypes = ['click', 'mousemove', 'keydown'];

    // 动态调度检测
    const scheduleCheck = (immediate = false) => {
      clearTimeout(checkTimer);

      const accessToken = authStore.getAccessToken();
      if (!accessToken) return;

      try {
        const { exp } = decodeJwt(accessToken);
        if (!exp) return;

        const remaining = exp * 1000 - Date.now();

        // 如果剩余时间小于30秒，提前刷新token
        if (remaining < 30000 && remaining > 0 && !isRefreshing.current) {
          const refreshToken = authStore.getRefreshToken();
          if (refreshToken) {
            // 设置刷新中标志
            isRefreshing.current = true;

            request
              .post('/auth/refresh', { refresh_token: refreshToken })
              .then((res: any) => {
                console.log('刷新Token响应:', res);
                // 检查响应格式是否正确
                if (res && res.access_token && res.refresh_token) {
                  // 直接使用顶层数据
                  const rememberMe = !!localStorage.getItem('refresh_token');
                  authStore.setTokens(res.access_token, res.refresh_token, rememberMe);
                  console.log('🔄 Token 已成功刷新！', new Date().toLocaleTimeString());
                } else if (res && res.data && res.data.access_token && res.data.refresh_token) {
                  // 使用嵌套的 data 对象
                  const rememberMe = !!localStorage.getItem('refresh_token');
                  authStore.setTokens(res.data.access_token, res.data.refresh_token, rememberMe);
                  console.log('🔄 Token 已成功刷新！', new Date().toLocaleTimeString());
                } else {
                  console.error('刷新Token响应格式不正确:', res);
                }
              })
              .catch(err => {
                console.error('刷新token失败', err);
              })
              .finally(() => {
                // 重置刷新中标志
                isRefreshing.current = false;
              });
          }
        }

        // 根据剩余时间设置检测策略
        const nextCheck =
          remaining > 24 * 3600 * 1000
            ? 3600 * 1000 // 超过1天：每小时检查
            : remaining > 3600 * 1000
            ? 5 * 60 * 1000 // 超过1小时：每5分钟
            : remaining > 60 * 1000
            ? 30 * 1000 // 超过1分钟：每30秒
            : Math.max(remaining - 5000, 1000); // 最后几秒：每秒检查

        checkTimer = setTimeout(() => scheduleCheck(), immediate ? 0 : nextCheck);
      } catch (error) {
        console.error('Token解析错误', error);
      }
    };

    // 用户活跃时触发立即检测
    const onUserActive = () => scheduleCheck(true);
    eventTypes.forEach(e => window.addEventListener(e, onUserActive));

    // 初始检测
    scheduleCheck();

    return () => {
      clearTimeout(checkTimer);
      eventTypes.forEach(e => window.removeEventListener(e, onUserActive));
    };
  }, []);
};
