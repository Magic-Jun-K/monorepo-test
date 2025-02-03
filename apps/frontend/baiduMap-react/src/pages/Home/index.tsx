import { FC } from 'react';
import { v4 as uuidv4 } from "uuid";
import { Swiper } from '@eggshell/unocss-ui';

import { BASE_URL } from '@/config';
import styles from './index.module.scss';

const swiperArray = [
  <img src={`${BASE_URL}/images/robot1.webp`} key={uuidv4()} />,
  <img src={`${BASE_URL}/images/robot2.webp`} key={uuidv4()} />,
  <img src={`${BASE_URL}/images/robot3.webp`} key={uuidv4()} />
];
const Home: FC = () => {
  return (
    <>
      <Swiper className={styles.swiper} loop autoPlay>
        {swiperArray}
      </Swiper>
      <div className={styles.showImages}>
        <h2>展示图片</h2>
        <img src={`${BASE_URL}/images/robot1.webp`} />
        <img src={`${BASE_URL}/images/robot2.webp`} />
        <img src={`${BASE_URL}/images/robot3.webp`} />
        <img src={`${BASE_URL}/images/robot4.webp`} />
        <img src={`${BASE_URL}/images/robot5.webp`} />
        <img src={`${BASE_URL}/images/robot6.webp`} />
        <img src={`${BASE_URL}/images/robot7.webp`} />
        <img src={`${BASE_URL}/images/robot8.webp`} />
      </div>
    </>
  );
};
export default Home;
