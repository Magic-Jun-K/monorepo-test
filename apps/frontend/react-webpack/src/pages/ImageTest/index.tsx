import { FC } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Swiper } from '@eggshell/tailwindcss-ui';

import LazyImage from '@/components/LazyImage';
import { BASE_URL } from '@/config';

const swiperArray = [
  // <img src={`${BASE_URL}/images/robot1.webp`} key={uuidv4()} />,
  // <img src={`${BASE_URL}/image/compressed/robot1.webp`} key={uuidv4()} />,
  <img className="w-full h-full" src={`${BASE_URL}/compressed/programmer1.webp`} key={uuidv4()} alt="Programmer 1" />,
  <img className="w-full h-full" src={`${BASE_URL}/compressed/programmer2.webp`} key={uuidv4()} alt="Programmer 2" />,
  <img className="w-full h-full" src={`${BASE_URL}/compressed/programmer3.webp`} key={uuidv4()} alt="Programmer 3" />
];
const ImageTest: FC = () => {
  return (
    <>
      <Swiper className="w-full h-[95vh]" loop autoPlay>
        {swiperArray}
      </Swiper>
      <section className="py-8 px-16">
        <h2 className="text-2xl mb-4">展示图片</h2>
        {/* <img src={`${BASE_URL}/images/robot1.webp`} />
        <img src={`${BASE_URL}/images/robot8.webp`} /> */}
        {/* <LazyImage src={`${BASE_URL}/images/robot1.webp`} alt="robot1" />
        <LazyImage src={`${BASE_URL}/images/robot8.webp`} alt="robot8" /> */}
        {/* <LazyImage src={`${BASE_URL}/image/compressed/robot1.webp`} alt="robot1" />
        <LazyImage src={`${BASE_URL}/image/compressed/robot8.webp`} alt="robot8" /> */}

        <LazyImage
          src={`${BASE_URL}/compressed/programmer4.webp`}
          alt="robot1"
          className="w-full h-full rounded-3xl mb-4"
        />
        <LazyImage
          src={`${BASE_URL}/compressed/programmer5.webp`}
          alt="robot2"
          className="w-full h-full rounded-3xl mb-4"
        />
        <LazyImage
          src={`${BASE_URL}/compressed/programmer6.webp`}
          alt="robot3"
          className="w-full h-full rounded-3xl mb-4"
        />
        <LazyImage
          src={`${BASE_URL}/compressed/programmer7.webp`}
          alt="robot4"
          className="w-full h-full rounded-3xl mb-4"
        />
        <LazyImage
          src={`${BASE_URL}/compressed/programmer8.webp`}
          alt="robot5"
          className="w-full h-full rounded-3xl mb-4"
        />
        <LazyImage
          src={`${BASE_URL}/compressed/programmer9.webp`}
          alt="robot6"
          className="w-full h-full rounded-3xl mb-4"
        />
        <LazyImage
          src={`${BASE_URL}/compressed/programmer10.webp`}
          alt="robot7"
          className="w-full h-full rounded-3xl mb-4"
        />
        <LazyImage
          src={`${BASE_URL}/compressed/programmer11.webp`}
          alt="robot8"
          className="w-full h-full rounded-3xl mb-4"
        />
      </section>
    </>
  );
};
export default ImageTest;