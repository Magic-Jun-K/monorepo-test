export interface ModalProps {
  /**
   * 是否可见
   */
  visible: boolean;
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
}
