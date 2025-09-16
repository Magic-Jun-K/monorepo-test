import { Form } from '@eggshell/antd-ui';
import { Modal, message, Input, Select } from '@eggshell/unocss-ui';
import { useEffect } from 'react';
import { updateUser } from '@/services/user';

interface EditUserModalProps {
  visible: boolean;
  user: any;
  onOk: () => void;
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function EditUserModal({
  visible,
  user,
  onOk,
  onCancel,
  onSuccess
}: EditUserModalProps) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // 当用户数据变化时，填充表单
  useEffect(() => {
    console.log('EditUserModal useEffect:', { visible, user });
    if (visible && user) {
      // 先重置表单，确保表单处于干净状态
      form.resetFields();

      const formData = {
        username: user.username,
        email: user.email ?? '',
        phone: user.phone ?? '',
        status: user.status
      };
      console.log('setting form values:', formData);

      form.setFieldsValue(formData);
    }
  }, [visible, user, form]);

  const handleUpdateUser = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理空字符串字段，将空字符串转换为null以符合数据库唯一约束
      const processedValues = {
        ...values,
        phone: values.phone === '' ? null : values.phone,
        email: values.email === '' ? null : values.email
      };
      
      console.log('提交的数据:', processedValues);
      const response = await updateUser(user.id, processedValues);
      if (response.success) {
        messageApi.success('更新用户成功');
        form.resetFields();
        onOk();
        onSuccess?.();
        onCancel();
      } else {
        messageApi.error(response.message || '更新用户失败');
      }
    } catch (error) {
      console.error('更新用户失败:', error);
      messageApi.error('更新用户失败');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <>
      {contextHolder}
      <Modal title="编辑用户" open={visible} onOk={handleUpdateUser} onCancel={handleCancel}>
        <Form
          form={form}
          layout="vertical"
          // initialValues={visible && user ? {
          //   username: user.username,
          //   email: user.email || '',
          //   phone: user.phone || '',
          //   status: user.status
          // } : {}}
        >
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
          <Form.Item
            name="status"
            label="用户状态"
            rules={[{ required: true, message: '请选择用户状态' }]}
          >
            <Select
              placeholder="请选择用户状态"
              options={[
                {
                  label: '活跃',
                  value: 'ACTIVE'
                },
                {
                  label: '未激活',
                  value: 'INACTIVE'
                },
                {
                  label: '暂停',
                  value: 'SUSPENDED'
                },
                {
                  label: '锁定',
                  value: 'LOCKED'
                }
              ]}
            ></Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
