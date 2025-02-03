import '@unocss/reset/tailwind.css'; // 引入 CSS 重置
import 'virtual:uno.css'; // 引入 UnoCSS 生成的样式
import { Button } from './components/Button';
import { Swiper } from './components/Swiper';
import './App.css';

const BASE_URL = 'http://localhost:7000';

function App() {
  return (
    <div className='w-full h-full'>
      <Button size='lg'>测试</Button>
      <div className='w-full h-200'>
        <Swiper className='w-full h-full' loop autoPlay>
          {/* <div className='w-full h-full bg-red-500'>111</div>
          <div className='w-full h-full bg-blue-500'>222</div>
          <div className='w-full h-full bg-green-500'>333</div> */}
          <img src={`${BASE_URL}/images/robot1.webp`} className='w-full h-full' />
          <img src={`${BASE_URL}/images/robot2.webp`} className='w-full h-full' />
          <img src={`${BASE_URL}/images/robot3.webp`} className='w-full h-full' />
        </Swiper>
      </div>
    </div>
  );
}
export default App;
