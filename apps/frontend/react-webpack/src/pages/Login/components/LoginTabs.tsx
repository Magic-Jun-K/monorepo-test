import { memo } from 'react';
import clsx from 'clsx';

interface LoginTabsProps {
  authType: 'login' | 'register';
  loginType: 'email' | 'account';
  setLoginType: (type: 'email' | 'account') => void;
}

export default memo(
  function LoginTabs({ authType, loginType, setLoginType }: LoginTabsProps) {
    return (
      <div className="flex pb-6">
        {authType === 'login' ? (
          <>
            <button
              className={clsx(
                'flex-1 text-center transition-all duration-200 text-2xl font-bold cursor-pointer',
                'hover:text-[rgb(51,139,255)]',
                loginType === 'account' ? 'text-[rgb(26,122,248)]' : 'text-slate-500',
              )}
              onClick={() => setLoginType('account')}
              type="button"
            >
              账号登录
            </button>
            <button
              className={clsx(
                'flex-1 text-center transition-all duration-200 text-2xl font-bold cursor-pointer',
                'hover:text-[rgb(51,139,255)]',
                loginType === 'email' ? 'text-[rgb(26,122,248)]' : 'text-slate-500',
              )}
              onClick={() => setLoginType('email')}
              type="button"
            >
              邮箱登录
            </button>
          </>
        ) : (
          <div className="flex-1 text-center text-[rgb(26,122,248)] transition-all duration-200 text-2xl font-bold">
            <span>注册账号</span>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) =>
    prevProps.authType === nextProps.authType && prevProps.loginType === nextProps.loginType,
);
