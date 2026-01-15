// import { FC, useState, useRef, useEffect, Children } from 'react';
// import { SwiperProps } from './types';

// const slideWidth = 100;

// export const Swiper: FC<SwiperProps> = ({ className, children, loop = false, autoPlay = false, autoPlayInterval = 3000 }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const slidesWrapperRef = useRef<HTMLDivElement>(null);
//   const autoPlayTimer = useRef<ReturnType<typeof setTimeout>>();

//   const totalSlides = Children.count(children);

//   const goToSlide = (index: number): void => {
//     if (isTransitioning) return undefined;

//     setIsTransitioning(true);

//     if (loop) {
//       if (index >= totalSlides) {
//         slidesWrapperRef.current!.style.transition = 'none';
//         slidesWrapperRef.current!.style.transform = `translateX(0%)`;
//         void slidesWrapperRef.current!.offsetWidth;
//         slidesWrapperRef.current!.style.transition = 'transform 0.3s ease';
//         setCurrentIndex(0);
//         return;
//       } else if (index < 0) {
//         slidesWrapperRef.current!.style.transition = 'none';
//         slidesWrapperRef.current!.style.transform = `translateX(-${(totalSlides - 1) * slideWidth}%)`;
//         void slidesWrapperRef.current!.offsetWidth;
//         slidesWrapperRef.current!.style.transition = 'transform 0.3s ease';
//         setCurrentIndex(totalSlides - 1);
//         return;
//       }
//     }

//     const clampedIndex = loop ? index : Math.max(0, Math.min(index, totalSlides - 1));
//     setCurrentIndex(clampedIndex);
//     return;
//   };

//   const nextSlide = () => goToSlide(currentIndex + 1);
//   const prevSlide = () => goToSlide(currentIndex - 1);

//   useEffect(() => {
//     if (autoPlay) {
//       autoPlayTimer.current = setInterval(() => {
//         if (!isTransitioning) {
//           if (loop) {
//             setCurrentIndex(prev => (prev + 1) % totalSlides);
//           } else {
//             setCurrentIndex(prev => Math.min(prev + 1, totalSlides - 1));
//           }
//         }
//       }, autoPlayInterval);
//     }

//     return () => {
//       if (autoPlayTimer.current) {
//         clearInterval(autoPlayTimer.current);
//       }
//     };
//   }, [autoPlay, autoPlayInterval, loop, totalSlides, isTransitioning]);

//   useEffect(() => {
//     const wrapper = slidesWrapperRef.current;
//     if (wrapper) {
//       const handleTransitionEnd = () => {
//         setIsTransitioning(false);
//       };

//       wrapper.style.transition = 'transform 0.3s ease';
//       wrapper.style.transform = `translateX(-${currentIndex * slideWidth}%)`;
//       wrapper.addEventListener('transitionend', handleTransitionEnd);

//       return () => {
//         wrapper.removeEventListener('transitionend', handleTransitionEnd);
//       };
//     }
//     return undefined;
//   }, [currentIndex]);

//   return (
//     <div className={`relative w-full overflow-hidden ${className || ''}`}>
//       <div
//         ref={slidesWrapperRef}
//         className="flex w-full h-full transition-transform duration-300 ease-in-out"
//         style={{
//           width: `${totalSlides * 100}%`,
//           transform: `translateX(-${currentIndex * (100 / totalSlides)}%)`
//         }}
//       >
//         {Children.map(children, (child, index) => (
//           <div
//             key={index}
//             className="w-full h-full flex-shrink-0"
//             style={{ width: `${100 / totalSlides}%` }}
//           >
//             <div className="w-full h-full">
//               {child}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div
//         onClick={prevSlide}
//         className="absolute left-16 top-1/2 -translate-y-1/2 w-6 h-6 border-t-5 border-l-5 border-white rotate-[-45deg] cursor-pointer z-1 hover:border-[rgb(255,105,0)] before:content-empty before:absolute before:w-16 before:h-16 before:block"
//       />
//       <div
//         onClick={nextSlide}
//         className="absolute right-16 top-1/2 -translate-y-1/2 w-6 h-6 border-t-5 border-l-5 border-white rotate-[135deg] cursor-pointer z-1 hover:border-[rgb(255,105,0)] before:content-empty before:absolute before:w-16 before:h-16 before:block"
//       />
//     </div>
//   );
// };
