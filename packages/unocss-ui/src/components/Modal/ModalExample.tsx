/**
 * @file ModalExample.tsx
 * @description Modal组件使用示例
 */
import React from 'react';
import { Button } from '../Button';
import { Modal } from './index';

const { confirm } = Modal;

export const ModalExample: React.FC = () => {
  const showConfirm = () => {
    confirm({
      title: 'Do you want to delete these items?',
      content: 'Some descriptions',
      onOk() {
        console.log('OK');
      },
      onCancel() {
        console.log('Cancel');
      }
    });
  };

  const showPromiseConfirm = () => {
    confirm({
      title: 'Do you want to delete these items?',
      content: 'When clicked the OK button, this dialog will be closed after 1 second',
      onOk() {
        return new Promise<void>((resolve, reject) => {
          setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
        }).catch(() => console.log('Oops errors!'));
      },
      onCancel() {}
    });
  };

  const showDeleteConfirm = () => {
    confirm({
      title: 'Are you sure delete this task?',
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        console.log('OK');
      },
      onCancel() {
        console.log('Cancel');
      }
    });
  };

  const showPropsConfirm = () => {
    confirm({
      title: 'Are you sure delete this task?',
      content: 'Some descriptions',
      okText: 'Yes',
      okType: 'danger',
      okButtonProps: {
        disabled: true
      },
      cancelText: 'No',
      onOk() {
        console.log('OK');
      },
      onCancel() {
        console.log('Cancel');
      }
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
