import { useState } from 'react';
import { Modal, Upload, message } from '@eggshell/unocss-ui';
import { ImportOutlined } from '@ant-design/icons';

import { importUsers } from '@/services/user';

import styles from './index.module.scss';

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
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleImportUsers = async () => {
    if (fileList.length === 0) {
      messageApi.error('请选择要导入的文件');
      return;
    }

    setUploading(true);
    try {
      const response = await importUsers(fileList[0].originFileObj);
      if (response.success) {
        messageApi.success(`成功导入 ${response.data.successCount} 个用户`);
        onOk();
        setFileList([]);
        onSuccess();

        if (response.data.errors && response.data.errors.length > 0) {
          messageApi.warning(`部分数据导入失败：${response.data.errors.join(', ')}`);
        }
      } else {
        messageApi.error(response.message || '导入失败');
      }
    } catch (error) {
      console.error('导入失败:', error);
      messageApi.error('导入失败');
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
        onOk={handleImportUsers}
        onCancel={() => {
          onCancel();
          setFileList([]);
        }}
        confirmLoading={uploading}
      >
        <div className={styles.uploadarea}>
          <Dragger
            name="file"
            multiple={false}
            beforeUpload={() => false}
            onChange={info => {
              setFileList(info.fileList.slice(-1));
            }}
            fileList={fileList}
            accept=".xlsx,.xls"
          >
            <p className="ant-upload-drag-icon">
              <ImportOutlined style={{ fontSize: 48 }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">仅支持上传 .xlsx 或 .xls 格式的 excel 文件</p>
          </Dragger>
        </div>
      </Modal>
    </>
  );
}