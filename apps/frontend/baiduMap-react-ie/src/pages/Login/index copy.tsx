// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import styles from './index.module.scss';

// type AuthType = 'login' | 'register';
// type LoginType = 'phone' | 'account';

// export default () => {
//   const [authType, setAuthType] = useState<AuthType>('login');
//   const [loginType, setLoginType] = useState<LoginType>('account');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   interface FormData {
//     username?: string;
//     phone?: string;
//     password: string;
//     confirmPassword?: string;
//     code?: string;
//     remember?: string;
//   }

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const formData = new FormData(e.currentTarget);
//       const data: FormData = {
//         username: formData.get('username')?.toString(),
//         phone: formData.get('phone')?.toString(),
//         password: formData.get('password')?.toString() || '',
//         confirmPassword: formData.get('confirmPassword')?.toString(),
//         code: formData.get('code')?.toString(),
//         remember: formData.get('remember')?.toString()
//       };
      
//       // Basic validation(基本验证)
//       if (authType === 'register' && data.password !== data.confirmPassword) {
//         alert('两次输入的密码不一致');
//         return;
//       }

//       if (loginType === 'phone' && !/^1[3-9]\d{9}$/.test(data.phone || '')) {
//         alert('请输入有效的手机号');
//         return;
//       }

//       // Simulate API call(模拟API调用)
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       navigate('/');
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         console.error('Login error:', error.message);
//       }
//       alert('登录失败，请稍后重试');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className={styles.loginContainer}>
//       <div className={styles.loginBox}>
//         {authType === 'login' && (
//           <div className={styles.tabs}>
//             <div
//               className={`${styles.tab} ${loginType === 'account' ? styles.active : ''}`}
//               onClick={() => setLoginType('account')}
//             >
//               <span>账号登录</span>
//             </div>
//             <div
//               className={`${styles.tab} ${loginType === 'phone' ? styles.active : ''}`}
//               onClick={() => setLoginType('phone')}
//             >
//               <span>手机登录</span>
//             </div>
//           </div>
//         )}

//         {authType === 'login' ? (
//           <>
//             {loginType === 'account' ? (
//               <form className={styles.form} onSubmit={handleSubmit}>
//                 <div className={styles.formGroup}>
//                   {/* <label htmlFor="username">用户名</label> */}
//                   <input
//                     id="username"
//                     type="text"
//                     placeholder="请输入用户名"
//                     required
//                   />
//                 </div>
//                 <div className={styles.formGroup}>
//                   {/* <label htmlFor="password">密码</label> */}
//                   <input
//                     id="password"
//                     type="password"
//                     placeholder="请输入密码"
//                     required
//                   />
//                 </div>
//                 <div className={styles.remember}>
//                   <label>
//                     <input type="checkbox" />
//                     记住我
//                   </label>
//                   <a href="#" className={styles.forgot}>
//                     忘记密码
//                   </a>
//                 </div>
//                 <button type="submit" disabled={loading} className={styles.submitButton}>
//                   {loading ? '登录中...' : '登录'}
//                 </button>
//               </form>
//             ) : (
//               <form className={styles.form} onSubmit={handleSubmit}>
//                 <div className={styles.formGroup}>
//                   {/* <label htmlFor="phone">手机号</label> */}
//                   <input
//                     id="phone"
//                     type="tel"
//                     pattern="^1[3-9]\d{9}$"
//                     placeholder="请输入手机号"
//                     required
//                   />
//                 </div>
//                 <div className={styles.formGroup}>
//                   {/* <label htmlFor="code">验证码</label> */}
//                   <div className={styles.codeInput}>
//                     <input
//                       id="code"
//                       type="text"
//                       placeholder="请输入验证码"
//                       required
//                     />
//                     <button type="button" className={styles.getCodeButton}>
//                       获取验证码
//                     </button>
//                   </div>
//                 </div>
//                 <button type="submit" disabled={loading} className={styles.submitButton}>
//                   {loading ? '登录中...' : '登录'}
//                 </button>
//               </form>
//             )}
//           </>
//         ) : (
//           <form className={styles.form} onSubmit={handleSubmit}>
//             <div className={styles.formGroup}>
//               <label htmlFor="username">用户名</label>
//               <input
//                 id="username"
//                 type="text"
//                 placeholder="请输入用户名"
//                 required
//               />
//             </div>
//             <div className={styles.formGroup}>
//               <label htmlFor="phone">手机号</label>
//               <input
//                 id="phone"
//                 type="tel"
//                 pattern="^1[3-9]\d{9}$"
//                 placeholder="请输入手机号"
//                 required
//               />
//             </div>
//             <div className={styles.formGroup}>
//               <label htmlFor="password">密码</label>
//               <input
//                 id="password"
//                 type="password"
//                 placeholder="请输入密码"
//                 required
//               />
//             </div>
//             <div className={styles.formGroup}>
//               <label htmlFor="confirmPassword">确认密码</label>
//               <input
//                 id="confirmPassword"
//                 type="password"
//                 placeholder="请再次输入密码"
//                 required
//               />
//             </div>
//             <button type="submit" disabled={loading} className={styles.submitButton}>
//               {loading ? '注册中...' : '立即注册'}
//             </button>
//           </form>
//         )}

//         <div className={styles.registerText}>
//           {authType === 'login' ? (
//             <>
//               没有账号？
//               <a href="#" onClick={() => setAuthType('register')}>
//                 立即注册
//               </a>
//             </>
//           ) : (
//             <>
//               已有账号？
//               <a href="#" onClick={() => setAuthType('login')}>
//                 立即登录
//               </a>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
