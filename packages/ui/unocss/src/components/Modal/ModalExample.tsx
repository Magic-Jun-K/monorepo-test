/**
 * @file ModalExample.tsx
 * @description Modal组件使用示例
 */
import type { FC } from 'react';

import { Button } from '../Button';
import { Modal } from './index';

const { confirm } = Modal;

export const ModalExample: FC = () => {
  const showConfirm = () => {
    confirm({
      title: 'Do you want to delete these items?',
      content: 'Some descriptions',
      onOk() {},
      onCancel() {},
    });
  };

  const showPromiseConfirm = () => {
    confirm({
      title: 'Do you want to delete these items?',
      content: 'When clicked the OK button, this dialog will be closed after 1 second',
      onOk() {
        return new Promise<void>((resolve, reject) => {
          setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => {});
      },
      onCancel() {},
    });
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Are you sure delete this task?',
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {},
      onCancel() {},
    });
  };

  const showPropsConfirm = () => {
    confirm({
      title: 'Are you sure delete this task?',
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      okButtonProps: {
        disabled: true,
      },
      cancelText: 'No',
      onOk() {},
      onCancel() {},
    });
  };

  return (
    <div className="space-x-2">
      <Button onClick={showConfirm}>Confirm</Button>
      <Button onClick={showPromiseConfirm}>With promise</Button>
      <Button onClick={showDeleteConfirm} danger>
        Delete
      </Button>
      <Button onClick={showPropsConfirm} danger>
        With extra props
      </Button>
    </div>
  );
};

export default ModalExample;
