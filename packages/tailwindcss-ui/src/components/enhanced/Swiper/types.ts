import { ReactNode } from 'react';

export interface SwiperProps {
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 轮播内容
   */
  children: ReactNode;
  /**
   * 是否循环播放
   */
  loop?: boolean;
  /**
   * 是否自动播放
   */
  autoPlay?: boolean;
  /**
   * 自动播放间隔时间(ms)
   */
  autoPlayInterval?: number;
}