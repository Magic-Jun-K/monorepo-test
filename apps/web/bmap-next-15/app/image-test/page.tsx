// pages/image-test.tsx 或 app/image-test/page.tsx (取决于使用 Pages Router 还是 App Router)
import { Swiper } from '@eggshell/ui-tailwind';
import LazyImage from '@/src/components/LazyImage';

// ⭐ ISR 关键配置：90天重新验证（3个月）
export const revalidate = 90 * 24 * 60 * 60; // 90天 = 3个月

// 1. 配置静态参数生成器（SSG关键）
export async function generateStaticParams() {
  // 空数组表示生成时就构建此页面，不依赖动态路由
  return [];
}

// 2. 数据获取移到组件外部（或使用fetch）
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

interface ImageItem {
  src: string;
  alt?: string;
}

// 3. 直接导出静态数据
const swiperImages: ImageItem[] = [
  { src: `${API_URL}/compressed/programmer1.webp`, alt: 'Programmer 1' },
  { src: `${API_URL}/compressed/programmer2.webp`, alt: 'Programmer 2' },
  { src: `${API_URL}/compressed/programmer3.webp`, alt: 'Programmer 3' }
];
const imageList: ImageItem[] = [
  { src: `${API_URL}/compressed/programmer4.webp`, alt: 'Programmer 4' },
  { src: `${API_URL}/compressed/programmer5.webp`, alt: 'Programmer 5' },
  { src: `${API_URL}/compressed/programmer6.webp`, alt: 'Programmer 6' },
  { src: `${API_URL}/compressed/programmer7.webp`, alt: 'Programmer 7' },
  { src: `${API_URL}/compressed/programmer8.webp`, alt: 'Programmer 8' },
  { src: `${API_URL}/compressed/programmer9.webp`, alt: 'Programmer 9' },
  { src: `${API_URL}/compressed/programmer10.webp`, alt: 'Programmer 10' },
  { src: `${API_URL}/compressed/programmer11.webp`, alt: 'Programmer 11' }
];

// 4. 页面组件改为同步（因为数据静态）
export default function ImageTest() {
  return (
    <>
      {/* Swiper 部分 - 使用普通 img 标签避免 Next.js Image 组件问题 */}
      <Swiper className="w-full h-[95vh]" loop autoPlay>
        {/* 使用普通 img 标签，避免 Next.js Image 组件的占位符问题 */}
        {swiperImages.map((img, index) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.alt || `Programmer ${index + 1}`}
            className="w-full h-full object-cover"
          />
        ))}
      </Swiper>

      {/* 图片列表部分 - 继续使用 LazyImage */}
      <section className="py-8 px-16">
        <h2 className="text-2xl mb-4">展示图片</h2>
        {imageList.map((img, index) => (
          <LazyImage
            src={img.src}
            alt={`robot${index + 1}`}
            key={img.src}
            className="w-full h-full rounded-3xl mb-4"
          />
        ))}
      </section>
    </>
  );
}
