import { useState } from 'react';
// import { Upload } from '@eggshell/ui-unocss';
import { Modal, message, Upload } from '@eggshell/ui-antd';
import { Button } from '@eggshell/ui-tailwind';
import { Import, Download, Info } from 'lucide-react';
// import type { UploadFile } from '@eggshell/ui-unocss/src/components/Upload/types';

// 定义 UploadFile 类型以解决 ts(2304) 错误
interface UploadFile {
  uid: string;
  name: string;
  size?: number;
  type: string;
  status?: 'uploading' | 'done' | 'error' | 'removed';
  percent?: number;
  response?: unknown;
  error?: unknown;
  url?: string;
  thumbUrl?: string;
  originFileObj?: File & {
    lastModifiedDate: Date;
    uid: string;
  };
}

import { importUsers } from '@/services/user';

import styles from './index.module.scss';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

const { Dragger } = Upload;

interface ImportUserModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ImportUserModal({
  visible,
  onOk,
  onCancel,
  onSuccess
}: ImportUserModalProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // 下载导入模板
  const handleDownloadTemplate = async () => {
    try {
      // 创建一个简单的模板数据
      const templateData = [
        {
          username: 'zhangsan',
          email: 'zhangsan@example.com',
          phone: '13812345678'
        },
        {
          username: 'lisi',
          email: 'lisi@company.com',
          phone: '13987654321'
        },
        {
          username: 'wangwu',
          email: '',
          phone: '15612345678'
        }
      ];

      // 创建Excel格式的CSV内容（兼容Excel中文显示）
      const csvHeader = '\uFEFFusername,email,phone\n'; // \uFEFF是BOM标记，确保Excel正确识别UTF-8编码
      const csvContent = templateData
        .map(row => `${row.username},${row.email},${row.phone}`)
        .join('\n');
      const csvData = csvHeader + csvContent;

      // 创建并下载文件
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', '用户导入模板.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      messageApi.success('模板下载成功，请使用Excel打开并编辑后保存为.xlsx格式');
    } catch (error) {
      console.error('下载模板失败:', error);
      messageApi.error('下载模板失败');
    }
  };

  const handleImportUsers = async () => {
    console.log('🔍 handleImportUsers 函数被调用');
    console.log('📂 当前文件列表:', fileList);

    if (fileList.length === 0) {
      console.log('❌ 文件列表为空');
      messageApi.error('请选择要导入的文件');
      return;
    }

    const file = fileList[0]?.originFileObj;
    console.log('📄 获取到的文件对象:', file);
    console.log('📄 完整的fileList[0]:', fileList[0]);

    if (!file) {
      console.log('❌ 文件对象为空或undefined');
      messageApi.error('文件信息不完整，请重新选择');
      return;
    }

    console.log('🚀 开始导入用户:', file.name);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await importUsers(formData) as ApiResponse<{
        successCount: number;
        errors: string[];
      }>;
      console.log('✅ 导入响应:', response);

      if (response.success) {
        const successCount = response.data?.successCount || 0;
        messageApi.success(`成功导入 ${successCount} 个用户`);
        onOk();
        setFileList([]);
        onSuccess();

        const errors = response.data?.errors;
        if (errors && errors.length > 0) {
          messageApi.warning(`部分数据导入失败：${errors.join(', ')}`);
        }
      } else {
        messageApi.error(response.message || '导入失败');
      }
    } catch (error) {
      console.error('❌ 导入失败:', error);
      messageApi.error('导入失败，请检查文件格式和网络连接');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="导入用户"
        open={visible}
        onOk={() => {
          console.log('✅ Modal onOk 被点击');
          handleImportUsers();
        }}
        onCancel={() => {
          console.log('❌ Modal onCancel 被点击');
          onCancel();
          setFileList([]);
        }}
        confirmLoading={uploading}
      >
        {/* 格式说明和模板下载 */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: '6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Info size={16} style={{ color: '#1890ff', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', color: '#1890ff' }}>
                导入格式说明
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <p style={{ margin: '4px 0' }}>
                  <strong>必填字段：</strong>username（用户名）
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>可选字段：</strong>email（邮箱）、phone（手机号）
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>注意：</strong>
                  ID、创建时间、更新时间等字段由系统自动生成，无需在文件中提供
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>提示：</strong>系统会自动为新用户分配"普通用户"角色，状态设为"活跃"
                </p>
                <Button
                  type="link"
                  icon={<Download size={16} />}
                  onClick={handleDownloadTemplate}
                  style={{ padding: 0, height: 'auto', marginTop: '4px' }}
                >
                  下载导入模板
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.uploadarea}>
          <Dragger
            name="file"
            multiple={false}
            beforeUpload={file => {
              console.log('📝 beforeUpload 被调用:', file);
              // 返回false阻止自动上传，我们手动控制上传时机
              return false;
            }}
            onChange={info => {
              console.log('📝 文件选择变化:', info);
              console.log('📝 文件列表:', info.fileList);
              console.log('📝 文件列表长度:', info.fileList.length);
              if (info.fileList.length > 0) {
                console.log('📝 第一个文件:', info.fileList[0]);
                // 添加安全检查以避免 TypeScript 错误
                if (info.fileList[0]) {
                  console.log('📝 originFileObj:', info.fileList[0].originFileObj);
                }
              }
              const newFileList = info.fileList.slice(-1);
              console.log('📝 设置的fileList:', newFileList);
              setFileList(newFileList as unknown as UploadFile[]);
              console.log('📝 设置后的fileList状态:', newFileList);
            }}
            onDrop={(e: React.DragEvent) => {
              console.log('📝 文件拖放:', e.dataTransfer.files);
            }}
            fileList={fileList as UploadFile[]}
            accept=".xlsx,.xls"
            showUploadList={{
              showRemoveIcon: true,
              showPreviewIcon: false,
              showDownloadIcon: false
            }}
          >
            <div className={styles.uploadContent}>
              <div className={styles.uploadIcon}>
                <Import size={24} />
              </div>
              <div className={styles.uploadText}>点击选择或拖放 Excel 文件到此区域</div>
              <div className={styles.uploadHint}>支持 .xlsx 和 .xls 格式，文件大小不超过 10MB</div>
            </div>
          </Dragger>

          {/* 添加文件列表显示 */}
          {fileList.length > 0 && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px'
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', color: '#1890ff', fontSize: '14px' }}>
                待上传文件：
              </h4>
              {fileList.map((file) => (
                <div
                  key={file.uid || file.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📄</span>
                    <div>
                      <div style={{ fontWeight: 500, color: '#262626' }}>{file.name}</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        大小: {file.size ? (file.size / 1024).toFixed(1) : '0'} KB | 状态: {file.status || '待上传'} |
                        originFileObj: {file.originFileObj ? '✓' : '✗'}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#52c41a' }}>✓ 已选择</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
