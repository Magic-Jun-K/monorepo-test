import { Form } from '@eggshell/antd-ui';
import { Modal, message, Input } from '@eggshell/unocss-ui';

import { createUser } from '@/services/user';

interface AddUserModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function AddUserModal({ visible, onOk, onCancel, onSuccess }: AddUserModalProps) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleAddUser = async () => {
    try {
      const values = await form.validateFields();
      const response = await createUser(values);
      if (response.success) {
        messageApi.success('新增用户成功');
        form.resetFields();
        onOk();
        onSuccess?.();
      } else {
        messageApi.error(response.message || '新增用户失败');
      }
    } catch (error) {
      console.error('新增用户失败:', error);
      messageApi.error('新增用户失败');
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="新增用户"
        open={visible}
        onOk={handleAddUser}
        onCancel={() => {
          form.resetFields();
          onCancel();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }]}
          >
            <Input placeholder="请输入手机号" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
