export interface MessageConfigBase {
  /**
   * 消息内容
   */
  content: string | React.ReactNode;
  /**
   * 消息持续时间，单位毫秒
   */
  duration?: number;
  /**
   * 关闭消息时调用
   */
  onClose?: () => void;
  /**
   * 消息唯一键
   */
  key?: string;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

export interface MessageConfig extends MessageConfigBase {
  /**
   * 消息类型
   */
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
}

export interface MessageInstance {
  success: (config: MessageConfigBase | string) => void;
  error: (config: MessageConfigBase | string) => void;
  warning: (config: MessageConfigBase | string) => void;
  info: (config: MessageConfigBase | string) => void;
  loading: (config: MessageConfigBase | string) => () => void;
  open: (config: MessageConfig | string) => void;
}
