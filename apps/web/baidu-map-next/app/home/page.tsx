'use client'

import { FC } from 'react';
import Image from 'next/image';
import { Swiper, Button } from '@eggshell/unocss-ui';
import { v4 as uuidv4 } from 'uuid';

// 这里假设您已经创建了这些组件或从百度地图应用中导入
import LazyImage from '@/components/LazyImage';
import { BASE_URL } from '@/config';

// 创建样式模块
const styles = {
  swiper: 'w-full h-[1000px]',
  showImages: 'p-8 md:p-16',
  heading: 'text-2xl mb-8',
  image: 'w-full h-auto rounded-3xl mb-8'
};

const swiperArray = ['robot1', 'robot2', 'robot3'];
// const swiperArray = [
//   <Image
//     src={`${BASE_URL}/image/public/compressed/robot1.webp`}
//     key={uuidv4()}
//     className="w-full h-full"
//     alt="Robot model 1 demonstration"
//   />,
//   <Image
//     src={`${BASE_URL}/image/public/compressed/robot2.webp`}
//     key={uuidv4()}
//     className="w-full h-full"
//     alt="Robot model 2 in operation"
//   />,
//   <Image src={`${BASE_URL}/image/public/compressed/robot3.webp`} key={uuidv4()} className="w-full h-full" alt="Robot model 3 prototype" />
// ];

const HomePage: FC = () => {
  return (
    <>
      <Swiper className={styles.swiper} loop autoPlay>
        {/* {swiperArray} */}
        {swiperArray.map(imgStr => (
          <Image
            src={`${BASE_URL}/image/public/compressed/${imgStr}.webp`}
            key={uuidv4()}
            className="w-full h-full"
            alt={`Robot model ${imgStr}`}
          />
        ))}
      </Swiper>
      <div className={styles.showImages}>
        <h2 className={styles.heading}>展示图片</h2>
        <LazyImage src={`${BASE_URL}/image/public/compressed/robot1.webp`} alt="robot1" className={styles.image} />
        <LazyImage src={`${BASE_URL}/image/public/compressed/robot2.webp`} alt="robot2" className={styles.image} />
        <LazyImage src={`${BASE_URL}/image/public/compressed/robot3.webp`} alt="robot3" className={styles.image} />
        <LazyImage src={`${BASE_URL}/image/public/compressed/robot4.webp`} alt="robot4" className={styles.image} />
        <LazyImage src={`${BASE_URL}/image/public/compressed/robot5.webp`} alt="robot5" className={styles.image} />
        <LazyImage src={`${BASE_URL}/image/public/compressed/robot6.webp`} alt="robot6" className={styles.image} />
        <LazyImage src={`${BASE_URL}/image/public/compressed/robot7.webp`} alt="robot7" className={styles.image} />
        <LazyImage src={`${BASE_URL}/image/public/compressed/robot8.webp`} alt="robot8" className={styles.image} />
      </div>
      <Button onClick={() => console.log('Test interaction')}>Test INP</Button>
    </>
  );
};
export default HomePage;
