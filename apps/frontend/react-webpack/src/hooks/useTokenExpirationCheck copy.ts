// import { useEffect } from 'react';
// import { decodeJwt } from 'jose';

// import { authStore } from '@/store/auth.store';
// import { refreshToken } from '@/services/auth';

// /**
//  * 监控 token 过期并自动处理的 hook
//  * 
//  * 功能：
//  * 1. 定期检查 token 是否过期
//  * 2. 在用户活跃时立即检查
//  * 3. 自动刷新过期的 token
//  * 4. 处理 token 刷新失败的情况
//  * 
//  * 检测策略：
//  * - 超过1天：每小时检查
//  * - 超过1小时：每5分钟检查
//  * - 最后5秒：每秒检查
//  * 
//  * @returns void
//  */
// export const useTokenExpirationCheck = (): void => {
//   useEffect(() => {
//     let checkTimer: NodeJS.Timeout;
//     const eventTypes = ['click', 'mousemove', 'keydown'];

//     // 动态调度检测
//     const scheduleCheck = (immediate = false) => {
//       clearTimeout(checkTimer);

//       const accessToken = authStore.getAccessToken();
//       if (!accessToken) return;

//       try {
//         const { exp } = decodeJwt(accessToken);
//         if (!exp) {
//           authStore.clear();
//           return;
//         }

//         const remaining = exp * 1000 - Date.now();

//         // 根据剩余时间设置检测策略
//         const nextCheck =
//           remaining > 24 * 3600 * 1000
//             ? 3600 * 1000 // 超过1天：每小时检查
//             : remaining > 3600 * 1000
//             ? 5 * 60 * 1000 // 超过1小时：每5分钟
//             : Math.max(remaining - 5000, 1000); // 最后5秒：每秒检查

//         checkTimer = setTimeout(
//           async () => {
//             if (exp * 1000 < Date.now()) {
//               try {
//                 // 尝试刷新token
//                 // const { data } = await axios
//                 //   .post(
//                 //     'api/auth/refresh',
//                 //     {},
//                 //     {
//                 //       withCredentials: true,
//                 //       baseURL: '' // 确保使用完整路径
//                 //     }
//                 //   )
//                 //   .then(res => res.data);
//                 const res = await refreshToken();
//                 authStore.setTokens(res.data);
//                 scheduleCheck(true); // 重新开始检查
//               } catch (error) {
//                 // 只有在刷新失败时，才清除token并跳转
//                 console.error('Token刷新失败:', error);
//                 authStore.clear();
//               }
//             } else {
//               scheduleCheck();
//             }
//           },
//           immediate ? 0 : nextCheck
//         );
//       } catch {
//         authStore.clear();
//       }
//     };

//     // 用户活跃时触发立即检测
//     const onUserActive = () => scheduleCheck(true);
//     eventTypes.forEach(e => window.addEventListener(e, onUserActive));

//     // 初始检测
//     scheduleCheck();

//     return () => {
//       clearTimeout(checkTimer);
//       eventTypes.forEach(e => window.removeEventListener(e, onUserActive));
//     };
//   }, []);
// };
