import { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Swiper } from '@eggshell/unocss-ui';

import LazyImage from '@/components/LazyImage';
import Footer from '@/layout/Footer';
import { BASE_URL } from '@/config';

const swiperArray = [
  <img
    src={`${BASE_URL}/image/public/compressed/robot1.webp`}
    key={uuidv4()}
    className="w-full h-full object-cover"
  />,
  <img
    src={`${BASE_URL}/image/public/compressed/robot2.webp`}
    key={uuidv4()}
    className="w-full h-full object-cover"
  />,
  <img
    src={`${BASE_URL}/image/public/compressed/robot3.webp`}
    key={uuidv4()}
    className="w-full h-full object-cover"
  />
];
const Home: FC = () => {
  return (
    <>
      <Swiper className="w-full h-[95vh]" loop autoPlay>
        {swiperArray}
      </Swiper>
      <section className="py-[2rem] px-[4rem]">
        <h2 className="text-[1.5rem]">展示图片</h2>
        <LazyImage
          src={`${BASE_URL}/image/public/compressed/robot1.webp`}
          alt="robot1"
          className="w-full h-full rounded-[24px] mb-[2rem]"
        />
        <LazyImage
          src={`${BASE_URL}/image/public/compressed/robot2.webp`}
          alt="robot2"
          className="w-full h-full rounded-[24px] mb-[2rem]"
        />
        <LazyImage
          src={`${BASE_URL}/image/public/compressed/robot3.webp`}
          alt="robot3"
          className="w-full h-full rounded-[24px] mb-[2rem]"
        />
        <LazyImage
          src={`${BASE_URL}/image/public/compressed/robot4.webp`}
          alt="robot4"
          className="w-full h-full rounded-[24px] mb-[2rem]"
        />
        <LazyImage
          src={`${BASE_URL}/image/public/compressed/robot5.webp`}
          alt="robot5"
          className="w-full h-full rounded-[24px] mb-[2rem]"
        />
        <LazyImage
          src={`${BASE_URL}/image/public/compressed/robot6.webp`}
          alt="robot6"
          className="w-full h-full rounded-[24px] mb-[2rem]"
        />
        <LazyImage
          src={`${BASE_URL}/image/public/compressed/robot7.webp`}
          alt="robot7"
          className="w-full h-full rounded-[24px] mb-[2rem]"
        />
        <LazyImage
          src={`${BASE_URL}/image/public/compressed/robot8.webp`}
          alt="robot8"
          className="w-full h-full rounded-[24px] mb-[2rem]"
        />
      </section>
      <Footer />
    </>
  );
};
export default Home;
