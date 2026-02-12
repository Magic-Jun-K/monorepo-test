import { useEffect, useRef, useState } from 'react';

export default function LazyImage({
  src,
  alt,
  className = '',
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false); // 图片是否加载完成
  const imgRef = useRef<HTMLImageElement>(null); // 图片元素的引用

  useEffect(() => {
    // 创建 IntersectionObserver 实例
    const observer = new IntersectionObserver((entries) => {
      // 遍历所有观察的元素
      entries.forEach((entry) => {
        // 如果元素可见
        if (entry.isIntersecting && imgRef.current) {
          // 设置图片源
          imgRef.current.src = src;
          // 图片加载完成
          imgRef.current.addEventListener('load', () => setIsLoaded(true));
          // 停止观察
          observer.unobserve(entry.target);
        }
      });
    });

    // 如果元素存在，开始观察
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    // 组件卸载时，停止观察
    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      alt={alt}
      className={className}
      style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.3s' }}
    />
  );
}
