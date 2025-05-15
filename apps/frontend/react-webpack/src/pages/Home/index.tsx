import { FC, /* useEffect */ } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Swiper } from '@eggshell/unocss-ui';

import LazyImage from '@/components/LazyImage';
import { BASE_URL } from '@/config';
// import * as api from '@/services';

import styles from './index.module.scss';

const swiperArray = [
  // <img src={`${BASE_URL}/images/robot1.webp`} key={uuidv4()} />,
  // <img src={`${BASE_URL}/image/compressed/robot1.webp`} key={uuidv4()} />,
  <img src={`${BASE_URL}/image/compressed/programmer1.webp`} key={uuidv4()} />,
  <img src={`${BASE_URL}/image/compressed/programmer2.webp`} key={uuidv4()} />,
  <img src={`${BASE_URL}/image/compressed/programmer3.webp`} key={uuidv4()} />
];
const Home: FC = () => {
  return (
    <>
      <Swiper className={styles.swiper} loop autoPlay>
        {swiperArray}
      </Swiper>
      <div className={styles.showImages}>
        <h2>展示图片</h2>
        {/* <img src={`${BASE_URL}/images/robot1.webp`} />
        <img src={`${BASE_URL}/images/robot8.webp`} /> */}
        {/* <LazyImage src={`${BASE_URL}/images/robot1.webp`} alt="robot1" />
        <LazyImage src={`${BASE_URL}/images/robot8.webp`} alt="robot8" /> */}
        {/* <LazyImage src={`${BASE_URL}/image/compressed/robot1.webp`} alt="robot1" />
        <LazyImage src={`${BASE_URL}/image/compressed/robot8.webp`} alt="robot8" /> */}
        <LazyImage src={`${BASE_URL}/image/compressed/programmer4.webp`} alt="robot1" />
        <LazyImage src={`${BASE_URL}/image/compressed/programmer5.webp`} alt="robot2" />
        <LazyImage src={`${BASE_URL}/image/compressed/programmer6.webp`} alt="robot3" />
        <LazyImage src={`${BASE_URL}/image/compressed/programmer7.webp`} alt="robot4" />
        <LazyImage src={`${BASE_URL}/image/compressed/programmer8.webp`} alt="robot5" />
        <LazyImage src={`${BASE_URL}/image/compressed/programmer9.webp`} alt="robot6" />
        <LazyImage src={`${BASE_URL}/image/compressed/programmer10.webp`} alt="robot7" />
        <LazyImage src={`${BASE_URL}/image/compressed/programmer11.webp`} alt="robot8" />
      </div>
    </>
  );
};
export default Home;
