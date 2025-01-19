import { FC, useState, useRef, useEffect } from 'react';
import { Container, SlidesWrapper, Slide, PrevButton, NextButton } from './styles';
import { SwiperProps } from './types';

const slideWidth = 100;
export const Swiper: FC<SwiperProps> = ({ className, children, loop = false, autoPlay = false, autoPlayInterval = 3000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slidesWrapperRef = useRef<HTMLDivElement>(null);
  const autoPlayTimer = useRef<NodeJS.Timeout>();

  const totalSlides = children.length;

  const goToSlide = (index: number) => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    if (loop) {
      // Handle loop logic(处理循环逻辑)
      if (index >= totalSlides) {
        // Jump to first slide without animation(无动画跳转到第一张幻灯片)
        slidesWrapperRef.current!.style.transition = 'none';
        slidesWrapperRef.current!.style.transform = `translateX(0%)`;

        // Force reflow(强制回流)
        void slidesWrapperRef.current!.offsetWidth;

        // Animate to first slide(为第一张幻灯片制作动画)
        slidesWrapperRef.current!.style.transition = 'transform 0.3s ease';
        setCurrentIndex(0);
      } else if (index < 0) {
        // Jump to last slide without animation(无动画跳转到最后一张幻灯片)
        slidesWrapperRef.current!.style.transition = 'none';
        slidesWrapperRef.current!.style.transform = `translateX(-${(totalSlides - 1) * slideWidth}%)`;

        // Force reflow(强制回流)
        void slidesWrapperRef.current!.offsetWidth;

        // Animate to last slide(为最后一张幻灯片制作动画)
        slidesWrapperRef.current!.style.transition = 'transform 0.3s ease';
        setCurrentIndex(totalSlides - 1);
      } else {
        setCurrentIndex(index);
      }
    } else {
      index = Math.max(0, Math.min(index, totalSlides - 1));
      setCurrentIndex(index);
    }
  };

  const nextSlide = () => goToSlide(currentIndex + 1);
  const prevSlide = () => goToSlide(currentIndex - 1);

  useEffect(() => {
    if (autoPlay) {
      autoPlayTimer.current = setInterval(() => {
        if (!isTransitioning) {
          if (loop) {
            // For loop mode, please always move on to the next slide(对于循环模式，请始终转到下一张幻灯片)
            setCurrentIndex(prev => (prev + 1) % totalSlides);
          } else {
            // For non cyclic mode, stop at the last swipe(对于非循环模式，在最后一次滑动时停止)
            setCurrentIndex(prev => Math.min(prev + 1, totalSlides - 1));
          }
        }
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, [autoPlay, autoPlayInterval, loop, totalSlides]);

  // 处理幻灯片转换
  useEffect(() => {
    if (slidesWrapperRef.current) {
      const handleTransitionEnd = () => {
        setIsTransitioning(false);
      };

      slidesWrapperRef.current.style.transition = 'transform 0.3s ease';
      slidesWrapperRef.current.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
      slidesWrapperRef.current.addEventListener('transitionend', handleTransitionEnd);

      return () => {
        if (slidesWrapperRef.current) {
          slidesWrapperRef.current.removeEventListener('transitionend', handleTransitionEnd);
        }
      };
    }
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      if (autoPlayTimer.current) {
        clearInterval(autoPlayTimer.current);
      }
    };
  }, []);

  return (
    <Container className={className}>
      <SlidesWrapper ref={slidesWrapperRef}>
        {children.map((child, index) => (
          <Slide key={index}>{child}</Slide>
        ))}
      </SlidesWrapper>

      <PrevButton onClick={prevSlide} />
      <NextButton onClick={nextSlide} />
    </Container>
  );
};
