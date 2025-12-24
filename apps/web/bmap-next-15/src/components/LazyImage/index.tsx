'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function LazyImage({ src, alt, className }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false); // 图片是否加载完成
  const [isInView, setIsInView] = useState(false); // 图片是否进入视口
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    console.error(`图片加载失败: ${src}`);
    const target = imgRef.current;
    if (target && target.parentElement) {
      target.parentElement.innerHTML = `
        <div class="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 rounded-3xl">
          <span>图片加载失败</span>
        </div>
      `;
    }
  };

  // 简化实现，直接使用 img 标签
  // Next.js 会在服务端渲染时输出 img 标签，客户端可以正常处理
  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined} // 只在可见时设置真实src
      alt={alt}
      className={className}
      style={{ 
        opacity: isLoaded ? 1 : 0, 
        transition: 'opacity 0.3s',
        backgroundColor: isLoaded ? 'transparent' : '#e5e7eb' // CSS 背景色占位
      }}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
