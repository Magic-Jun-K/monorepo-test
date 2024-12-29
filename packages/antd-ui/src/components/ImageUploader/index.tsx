/**
 * 图片上传组件
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Upload, message, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import styled from 'styled-components';

export interface ImageService {
  uploadImage: (file: File) => Promise<{
    success: boolean;
    data: { filename: string };
  }>;
  getImageUrl: (filename: string) => string;
}

export interface ImageUploaderProps {
  /** 图片URL数组 */
  value?: string[];
  /** 值变化回调 */
  onChange?: (urls: string[]) => void;
  /** 最大上传数量 */
  maxCount?: number;
  /** 自定义上传服务 */
  imageService: ImageService;
  /** 上传按钮文案 */
  uploadText?: string;
  /** 上传成功提示文案 */
  successText?: string;
  /** 上传失败提示文案 */
  errorText?: string;
}

const StyledImageUploader = styled.div`
  .ant-upload-list-picture-card {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ant-upload.ant-upload-select-picture-card {
    width: 104px;
    height: 104px;
    margin: 0;
  }

  .ant-upload-list-picture-card-container {
    width: 104px;
    height: 104px;
    margin: 0;
  }
`;

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = [],
  onChange,
  maxCount = 5,
  imageService,
  uploadText = '上传图片',
  successText = '上传成功',
  errorText = '上传失败',
}) => {
  // 将 value 转换为 fileList 格式
  const valueToFileList = (urls: string[]): UploadFile[] => {
    return urls.map((url, index) => ({
      uid: `-${index}`,
      name: url.split('/').pop() || 'image',
      status: 'done',
      url,
    }));
  };

  const [fileList, setFileList] = useState<UploadFile[]>(() => valueToFileList(value));
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // 同步外部 value 变化
  useEffect(() => {
    if (value && !value.every((url, index) => url === fileList[index]?.url)) {
      setFileList(valueToFileList(value));
    }
  }, [value]);

  // 处理文件上传
  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const actualFile = file as File;
      const result = await imageService.uploadImage(actualFile);
      
      if (result.success) {
        message.success(successText);
        const newFileList: UploadFile[] = [...fileList, {
          uid: result.data.filename,
          name: actualFile.name,
          status: 'done',
          url: imageService.getImageUrl(result.data.filename),
        }];
        setFileList(newFileList);
        onChange?.(newFileList.map(file => file.url || '').filter(Boolean));
        onSuccess?.(result);
      } else {
        throw new Error(errorText);
      }
    } catch (error) {
      message.error(errorText);
      onError?.(error as Error);
    }
  };

  // 处理文件预览
  const handlePreview = useCallback((file: UploadFile) => {
    setPreviewImage(file.url || '');
    setPreviewTitle(file.name || '预览图片');
    setPreviewOpen(true);
  }, []);

  // 处理文件移除
  const handleRemove = useCallback((file: UploadFile) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    onChange?.(newFileList.map(file => file.url || '').filter(Boolean));
    return true;
  }, [fileList, onChange]);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>{uploadText}</div>
    </div>
  );

  return (
    <StyledImageUploader>
      <Upload
        listType="picture-card"
        fileList={fileList}
        customRequest={handleUpload}
        onPreview={handlePreview}
        onRemove={handleRemove}
        maxCount={maxCount}
        accept="image/*"
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>

      {/* 图片预览 */}
      <Image
        style={{ display: 'none' }}
        preview={{
          visible: previewOpen,
          onVisibleChange: setPreviewOpen,
          title: previewTitle,
        }}
        src={previewImage}
        alt={previewTitle}
      />
    </StyledImageUploader>
  );
};

export default ImageUploader;
