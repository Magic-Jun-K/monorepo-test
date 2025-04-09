export interface ModalProps {
  /**
   * 是否可见
   */
  open: boolean;
  /**
   * 标题
   */
  title?: string;
  /**
   * 取消回调
   */
  onCancel: () => void;
  /**
   * 确定回调
   */
  onOk?: () => void;
  /**
   * 内容
   */
  children: React.ReactNode;
  /**
   * 底部
   */
  footer?: React.ReactNode;
  /**
   * 宽度
   */
  width?: number | string;
  /**
   * 样式配置
   */
  styles?: {
    mask?: React.CSSProperties;
    wrapper?: React.CSSProperties;
    header?: React.CSSProperties;
    body?: React.CSSProperties;
    footer?: React.CSSProperties;
    content?: React.CSSProperties;
  };
}
