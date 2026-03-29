import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  message,
  Card,
  List,
  Skeleton,
  Typography,
} from '@eggshell/ui-antd';
import { User, Shield, Smartphone, Upload as UploadIcon, Mail, Phone } from 'lucide-react';
import {
  getProfile,
  updateProfile,
  changePassword,
  setPassword,
  uploadAvatar,
  type UserProfileData,
} from '@/services/user';

const { Title } = Typography;

// Schema for Basic Info
const basicInfoSchema = z.object({
  nickname: z.string().min(2, '昵称至少2个字符').optional(),
  bio: z.string().max(200, '个人简介最多200字符').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  phone: z.string().optional(), // Add regex for phone if needed
});

// Schema for Change Password
const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, '请输入旧密码'),
    newPassword: z
      .string()
      .min(8, '密码至少8位')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/, '密码需包含大小写字母和数字'),
    confirmPassword: z.string().min(1, '请确认新密码'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

// Schema for Set Password
const setPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, '密码至少8位')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/, '密码需包含大小写字母和数字'),
    confirmPassword: z.string().min(1, '请确认新密码'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

export default function UserProfile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  const {
    control: basicControl,
    handleSubmit: handleBasicSubmit,
    reset: resetBasic,
  } = useForm({
    resolver: zodResolver(basicInfoSchema),
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
  } = useForm<z.infer<typeof changePasswordSchema> | z.infer<typeof setPasswordSchema>>({
    resolver: zodResolver(user?.hasPassword ? changePasswordSchema : setPasswordSchema),
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res.success) {
        setUser(res.data);
        setAvatarUrl(res.data.profile?.avatar || '');
        resetBasic({
          nickname: res.data.profile?.nickname || '',
          bio: res.data.profile?.bio || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
        });
      }
    } catch {
      message.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  }, [resetBasic]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onBasicSubmit = async (data: z.infer<typeof basicInfoSchema>) => {
    try {
      const res = await updateProfile(data);
      if (res.success) {
        message.success('基本信息更新成功');
        fetchProfile();
      }
    } catch {
      message.error('更新失败');
    }
  };

  const onPasswordSubmit = async (
    data: z.infer<typeof changePasswordSchema> | z.infer<typeof setPasswordSchema>,
  ) => {
    try {
      if (user?.hasPassword) {
        const res = await changePassword({
          oldPassword: 'oldPassword' in data ? data.oldPassword : '',
          newPassword: data.newPassword,
        });
        if (res.success) {
          message.success('密码修改成功');
          resetPassword();
        }
      } else {
        const res = await setPassword({
          newPassword: data.newPassword,
        });
        if (res.success) {
          message.success('密码设置成功');
          fetchProfile(); // Update hasPassword status
          resetPassword();
        }
      }
    } catch {
      message.error(user?.hasPassword ? '密码修改失败，请检查旧密码' : '密码设置失败');
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await uploadAvatar(formData);
      if (res.success) {
        setAvatarUrl(res.data.url);
        message.success('头像上传成功');
        fetchProfile();
      }
    } catch {
      message.error('头像上传失败');
    }
    return false; // Prevent default upload behavior
  };

  if (loading) {
    return <Skeleton active avatar paragraph={{ rows: 4 }} />;
  }

  const items = [
    {
      key: '1',
      label: (
        <span className="flex items-center gap-2">
          <User size={16} />
          基本信息
        </span>
      ),
      children: (
        <div className="max-w-2xl py-6">
          <div className="flex items-start gap-8 mb-8">
            <div className="flex flex-col items-center gap-4">
              <Avatar size={100} src={avatarUrl} icon={<User />} />
              <Upload showUploadList={false} beforeUpload={handleAvatarUpload}>
                <Button icon={<UploadIcon size={16} />}>更换头像</Button>
              </Upload>
            </div>
            <Form layout="vertical" className="flex-1" onFinish={handleBasicSubmit(onBasicSubmit)}>
              <Form.Item label="昵称">
                <Controller
                  name="nickname"
                  control={basicControl}
                  render={({ field, fieldState }) => (
                    <>
                      <Input {...field} placeholder="请输入昵称" />
                      {fieldState.error && (
                        <span className="text-red-500 text-sm">{fieldState.error.message}</span>
                      )}
                    </>
                  )}
                />
              </Form.Item>
              <Form.Item label="个人简介">
                <Controller
                  name="bio"
                  control={basicControl}
                  render={({ field, fieldState }) => (
                    <>
                      <Input.TextArea {...field} placeholder="介绍一下自己" rows={4} />
                      {fieldState.error && (
                        <span className="text-red-500 text-sm">{fieldState.error.message}</span>
                      )}
                    </>
                  )}
                />
              </Form.Item>
              <Form.Item label="邮箱">
                <Controller
                  name="email"
                  control={basicControl}
                  render={({ field, fieldState }) => (
                    <>
                      <Input {...field} prefix={<Mail size={16} />} placeholder="绑定邮箱" />
                      {fieldState.error && (
                        <span className="text-red-500 text-sm">{fieldState.error.message}</span>
                      )}
                    </>
                  )}
                />
              </Form.Item>
              <Form.Item label="手机号">
                <Controller
                  name="phone"
                  control={basicControl}
                  render={({ field, fieldState }) => (
                    <>
                      <Input {...field} prefix={<Phone size={16} />} placeholder="绑定手机号" />
                      {fieldState.error && (
                        <span className="text-red-500 text-sm">{fieldState.error.message}</span>
                      )}
                    </>
                  )}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit">
                保存修改
              </Button>
            </Form>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center gap-2">
          <Shield size={16} />
          账户安全
        </span>
      ),
      children: (
        <div className="max-w-xl py-6">
          <Title level={5} className="mb-4">
            {user?.hasPassword ? '修改密码' : '设置密码'}
          </Title>
          <Form layout="vertical" onFinish={handlePasswordSubmit(onPasswordSubmit)}>
            {user?.hasPassword && (
              <Form.Item label="当前密码">
                <Controller
                  name="oldPassword"
                  control={passwordControl}
                  render={({ field, fieldState }) => (
                    <>
                      <Input.Password {...field} placeholder="请输入当前密码" />
                      {fieldState.error && (
                        <span className="text-red-500 text-sm">{fieldState.error.message}</span>
                      )}
                    </>
                  )}
                />
              </Form.Item>
            )}
            <Form.Item label="新密码">
              <Controller
                name="newPassword"
                control={passwordControl}
                render={({ field, fieldState }) => (
                  <>
                    <Input.Password {...field} placeholder="8位以上，包含大小写字母和数字" />
                    {fieldState.error && (
                      <span className="text-red-500 text-sm">{fieldState.error.message}</span>
                    )}
                  </>
                )}
              />
            </Form.Item>
            <Form.Item label="确认新密码">
              <Controller
                name="confirmPassword"
                control={passwordControl}
                render={({ field, fieldState }) => (
                  <>
                    <Input.Password {...field} placeholder="请再次输入新密码" />
                    {fieldState.error && (
                      <span className="text-red-500 text-sm">{fieldState.error.message}</span>
                    )}
                  </>
                )}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              {user?.hasPassword ? '修改密码' : '设置密码'}
            </Button>
          </Form>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <span className="flex items-center gap-2">
          <Smartphone size={16} />
          登录方式
        </span>
      ),
      children: (
        <div className="max-w-2xl py-6">
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                title: '微信',
                description: '已绑定微信账号',
                icon: <Smartphone className="text-green-600" />,
                connected: false, // Placeholder
              },
              {
                title: 'GitHub',
                description: '绑定 GitHub 账号以快速登录',
                icon: <Smartphone className="text-gray-800" />,
                connected: false, // Placeholder
              },
            ]}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" key="bind">
                    {item.connected ? '解绑' : '去绑定'}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={item.icon} className="bg-transparent" />}
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card title="个人中心" variant="borderless">
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    </div>
  );
}
