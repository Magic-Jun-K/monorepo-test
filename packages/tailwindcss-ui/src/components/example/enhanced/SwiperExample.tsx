/**
 * @file SwiperExample.tsx
 * @description Swiper 组件使用示例
 */
import { FC } from 'react';
import { Swiper } from '../../enhanced/Swiper';

export const EnhancedSwiperExample: FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Swiper 轮播图组件示例</h2>
      
      {/* 基础轮播图 */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">基础轮播图</h3>
        <div className="h-64 w-full max-w-2xl">
          <Swiper>
            <div className="bg-blue-500 w-full h-full flex items-center justify-center text-white text-2xl">
              幻灯片 1
            </div>
            <div className="bg-green-500 w-full h-full flex items-center justify-center text-white text-2xl">
              幻灯片 2
            </div>
            <div className="bg-red-500 w-full h-full flex items-center justify-center text-white text-2xl">
              幻灯片 3
            </div>
            <div className="bg-purple-500 w-full h-full flex items-center justify-center text-white text-2xl">
              幻灯片 4
            </div>
          </Swiper>
        </div>
      </div>
      
      {/* 循环播放轮播图 */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">循环播放轮播图</h3>
        <div className="h-64 w-full max-w-2xl">
          <Swiper loop>
            <div className="bg-yellow-500 h-full flex items-center justify-center text-white text-2xl">
              幻灯片 1
            </div>
            <div className="bg-indigo-500 h-full flex items-center justify-center text-white text-2xl">
              幻灯片 2
            </div>
            <div className="bg-pink-500 h-full flex items-center justify-center text-white text-2xl">
              幻灯片 3
            </div>
          </Swiper>
        </div>
      </div>
      
      {/* 自动播放轮播图 */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">自动播放轮播图</h3>
        <div className="h-64 w-full max-w-2xl">
          <Swiper loop autoPlay autoPlayInterval={2000}>
            <div className="bg-teal-500 h-full flex items-center justify-center text-white text-2xl">
              幻灯片 1
            </div>
            <div className="bg-orange-500 h-full flex items-center justify-center text-white text-2xl">
              幻灯片 2
            </div>
            <div className="bg-cyan-500 h-full flex items-center justify-center text-white text-2xl">
              幻灯片 3
            </div>
            <div className="bg-lime-500 h-full flex items-center justify-center text-white text-2xl">
              幻灯片 4
            </div>
          </Swiper>
        </div>
      </div>
    </div>
  );
};