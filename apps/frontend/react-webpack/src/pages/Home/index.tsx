import { FC, /* useEffect */ } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Swiper, Button } from '@eggshell/unocss-ui';

import LazyImage from '@/components/LazyImage';
import { BASE_URL } from '@/config';
// import * as api from '@/services';

import styles from './index.module.scss';

const swiperArray = [
  // <img src={`${BASE_URL}/images/robot1.webp`} key={uuidv4()} />,
  // <img src={`${BASE_URL}/images/robot2.webp`} key={uuidv4()} />,
  // <img src={`${BASE_URL}/images/robot3.webp`} key={uuidv4()} />
  <img src={`${BASE_URL}/image/compressed/robot1.webp`} key={uuidv4()} />,
  <img src={`${BASE_URL}/image/compressed/robot2.webp`} key={uuidv4()} />,
  <img src={`${BASE_URL}/image/compressed/robot3.webp`} key={uuidv4()} />
];
const Home: FC = () => {
  // useEffect(() => {
  //   api['currentUser']()
  //     .then(res => {
  //       console.log('用户信息获取成功:', res);
  //     })
  //     .catch(err => {
  //       console.log('用户信息获取失败:', err);
  //       if (err.response) {
  //         console.log('错误状态码:', err.response.status);
  //         console.log('错误详情:', err.response.data);

  //         // 如果是403错误，尝试调用其他接口验证是否所有接口都有权限问题
  //         if (err.response.status === 403) {
  //           console.log('尝试调用其他接口验证权限...');
  //         }
  //       }
  //     });
  // }, []);

  return (
    <>
      <Swiper className={styles.swiper} loop autoPlay>
        {swiperArray}
      </Swiper>
      <div className={styles.showImages}>
        <h2>展示图片</h2>
        {/* <img src={`${BASE_URL}/images/robot1.webp`} />
        <img src={`${BASE_URL}/images/robot2.webp`} />
        <img src={`${BASE_URL}/images/robot3.webp`} />
        <img src={`${BASE_URL}/images/robot4.webp`} />
        <img src={`${BASE_URL}/images/robot5.webp`} />
        <img src={`${BASE_URL}/images/robot6.webp`} />
        <img src={`${BASE_URL}/images/robot7.webp`} />
        <img src={`${BASE_URL}/images/robot8.webp`} /> */}
        {/* <LazyImage src={`${BASE_URL}/images/robot1.webp`} alt="robot1" />
        <LazyImage src={`${BASE_URL}/images/robot2.webp`} alt="robot2" />
        <LazyImage src={`${BASE_URL}/images/robot3.webp`} alt="robot3" />
        <LazyImage src={`${BASE_URL}/images/robot4.webp`} alt="robot4" />
        <LazyImage src={`${BASE_URL}/images/robot5.webp`} alt="robot5" />
        <LazyImage src={`${BASE_URL}/images/robot6.webp`} alt="robot6" />
        <LazyImage src={`${BASE_URL}/images/robot7.webp`} alt="robot7" />
        <LazyImage src={`${BASE_URL}/images/robot8.webp`} alt="robot8" /> */}
        <LazyImage src={`${BASE_URL}/image/compressed/robot1.webp`} alt="robot1" />
        <LazyImage src={`${BASE_URL}/image/compressed/robot2.webp`} alt="robot2" />
        <LazyImage src={`${BASE_URL}/image/compressed/robot3.webp`} alt="robot3" />
        <LazyImage src={`${BASE_URL}/image/compressed/robot4.webp`} alt="robot4" />
        <LazyImage src={`${BASE_URL}/image/compressed/robot5.webp`} alt="robot5" />
        <LazyImage src={`${BASE_URL}/image/compressed/robot6.webp`} alt="robot6" />
        <LazyImage src={`${BASE_URL}/image/compressed/robot7.webp`} alt="robot7" />
        <LazyImage src={`${BASE_URL}/image/compressed/robot8.webp`} alt="robot8" />
      </div>
      <Button onClick={() => console.log('Test interaction')}>Test INP</Button>
    </>
  );
};
export default Home;
