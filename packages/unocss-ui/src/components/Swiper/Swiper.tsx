import { FC, useState, useRef, useEffect, Children, useCallback } from 'react';
import { SwiperProps } from './types';

export const Swiper: FC<SwiperProps> = ({ className, children, loop = false, autoPlay = false, autoPlayInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimer = useRef<ReturnType<typeof setTimeout>>();

  const totalSlides = Children.count(children);

  const goToSlide = useCallback(
    (index: number): void => {
      if (isTransitioning) return undefined;
      setIsTransitioning(true);

      let targetIndex = index;
      if (loop) {
        if (index >= totalSlides) {
          targetIndex = 0;
        } else if (index < 0) {
          targetIndex = totalSlides - 1;
        }
      } else {
        targetIndex = Math.max(0, Math.min(index, totalSlides - 1));
      }

      setCurrentIndex(targetIndex);
      return;
    },
    [isTransitioning, loop, totalSlides]
  );

  const nextSlide = useCallback(() => goToSlide(currentIndex + 1), [currentIndex, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentIndex - 1), [currentIndex, goToSlide]);

  // 自动播放
  useEffect(() => {
    if (autoPlay && loop) {
      autoPlayTimer.current = setInterval(() => {
        if (!isTransitioning) {
          nextSlide();
        }
      }, autoPlayInterval);

      return () => {
        if (autoPlayTimer.current) {
          clearInterval(autoPlayTimer.current);
        }
      };
    }
    return undefined;
  }, [autoPlay, autoPlayInterval, loop, isTransitioning, nextSlide]);

  // 处理过渡动画
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const handleTransitionEnd = () => {
        setIsTransitioning(false);
      };

      container.addEventListener('transitionend', handleTransitionEnd);
      return () => {
        container.removeEventListener('transitionend', handleTransitionEnd);
      };
    }
    return undefined;
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ''}`}>
      {/* 轮播容器 */}
      <div
        ref={containerRef}
        className="flex h-full transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`
        }}
      >
        {/* 轮播项 */}
        {Children.map(children, child => (
          <div className="flex-[0_0_100%] box-border">{child}</div>
        ))}
      </div>

      {/* 上一张按钮 */}
      <div
        onClick={prevSlide}
        className="absolute left-16 top-1/2 -translate-y-1/2 w-6 h-6 border-t-5 border-l-5 border-white rotate-[-45deg] cursor-pointer z-10 hover:border-[rgb(255,105,0)] before:content-[''] before:absolute before:w-16 before:h-16 before:block"
      />

      {/* 下一张按钮 */}
      <div
        onClick={nextSlide}
        className="absolute right-16 top-1/2 -translate-y-1/2 w-6 h-6 border-t-5 border-l-5 border-white rotate-[135deg] cursor-pointer z-10 hover:border-[rgb(255,105,0)] before:content-[''] before:absolute before:w-16 before:h-16 before:block"
      />
    </div>
  );
};
