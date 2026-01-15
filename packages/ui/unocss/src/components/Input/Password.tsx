/**
 * @file Password.tsx
 * @description 密码输入框组件
 */
import { forwardRef, useState } from 'react';
import { Icon } from '@iconify/react';
import { icons } from '@iconify-json/heroicons/icons.json';

import type { PasswordProps } from './types';
import { Input } from './Input';

export const Password = forwardRef<HTMLInputElement, PasswordProps>(
  ({ visibilityToggle = true, suffix, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    const toggleVisible = () => {
      setVisible(!visible);
    };

    const passwordSuffix = visibilityToggle ? (
      <button
        type="button"
        className="cursor-pointer bg-transparent border-0 p-0"
        onClick={toggleVisible}
        aria-label={visible ? '隐藏密码' : '显示密码'}
      >
        {visible ? <Icon icon={icons.eye} /> : <Icon icon={icons['eye-slash']} />}
      </button>
    ) : null;

    const combinedSuffix = suffix ? (
      <div className="flex items-center">
        {suffix}
        {passwordSuffix}
      </div>
    ) : (
      passwordSuffix
    );

    return (
      <Input ref={ref} type={visible ? 'text' : 'password'} suffix={combinedSuffix} {...props} />
    );
  },
);
