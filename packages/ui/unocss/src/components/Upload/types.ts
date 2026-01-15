import type { ReactNode, ForwardRefExoticComponent, RefAttributes } from 'react';

// 文件状态
export type UploadFileStatus = 'uploading' | 'done' | 'error' | 'removed';

// 文件列表项类型
export interface UploadFile {
  uid: string;
  name: string;
  size: number;
  type: string;
  status?: UploadFileStatus;
  percent?: number;
  response?: unknown;
  error?: unknown;
  url?: string;
  thumbUrl?: string;
  originFileObj?: File;
}

// 列表类型
export type UploadListType = 'text' | 'picture' | 'picture-card';

// 自定义请求参数
export interface UploadRequestOption {
  file: File;
  onProgress: (percent: number) => void;
  onSuccess: (response: unknown) => void;
  onError: (error: unknown) => void;
}

// 上传变更参数
export interface UploadChangeParam {
  file: UploadFile;
  fileList: UploadFile[];
}

// 组件属性
export interface UploadProps {
  /**
   * 上传的文件字段名
   */
  name?: string;
  /**
   * 接受上传的文件类型
   */
  accept?: string;
  /**
   * 是否支持多选文件
   */
  multiple?: boolean;
  /**
   * 是否支持上传文件夹
   */
  directory?: boolean;
  /**
   * 是否禁用
   */
  disabled?: boolean;
  /**
   * 上传列表的内建样式
   */
  listType?: UploadListType;
  /**
   * 是否展示文件列表，或配置展示选项
   */
  showUploadList?:
    | boolean
    | {
        showRemoveIcon?: boolean;
        showPreviewIcon?: boolean;
        showDownloadIcon?: boolean;
      };
  /**
   * 默认已上传的文件列表
   */
  defaultFileList?: UploadFile[];
  /**
   * 已上传的文件列表（受控）
   */
  fileList?: UploadFile[];
  /**
   * 限制上传数量
   */
  maxCount?: number;
  /**
   * 上传文件改变时的回调
   */
  onChange?: (info: UploadChangeParam) => void;
  /**
   * 点击移除文件时的回调，返回值为 false 时不移除
   */
  onRemove?: (file: UploadFile) => boolean | Promise<boolean> | void;
  /**
   * 上传文件之前的钩子，返回 false 则停止上传
   */
  beforeUpload?: (file: File, fileList: File[]) => boolean | Promise<boolean> | void;
  /**
   * 拖拽文件时的回调
   */
  onDrop?: (event: React.DragEvent<HTMLElement>) => void;
  /**
   * 自定义上传请求
   */
  customRequest?: (options: UploadRequestOption) => void;
  /**
   * 子元素
   */
  children?: ReactNode;
  /**
   * 自定义类名
   */
  className?: string;
}

// Upload组件类型，包含Dragger静态属性
export interface UploadComponentType extends ForwardRefExoticComponent<
  UploadProps & RefAttributes<HTMLDivElement>
> {
  Dragger: ForwardRefExoticComponent<UploadProps & RefAttributes<HTMLDivElement>>;
}
