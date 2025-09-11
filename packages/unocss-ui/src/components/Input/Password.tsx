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
      <span className="cursor-pointer" onClick={toggleVisible}>
        {visible ? <Icon icon={icons.eye} /> : <Icon icon={icons['eye-slash']} />}
      </span>
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
  }
);
