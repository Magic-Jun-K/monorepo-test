import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
`;

export const SlidesWrapper = styled.div`
  height: 100%;
  display: flex;
  transition: transform 0.3s ease;
`;

export const Slide = styled.div`
  flex: 0 0 100%;
  box-sizing: border-box;
`;

export const SwiperButton = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  cursor: pointer;
  z-index: 1;
  width: 1.5rem;
  height: 1.5rem;
  border-top: 5px solid #fff;
  border-left: 5px solid #fff;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    width: 4rem;
    height: 4rem;
    display: block;
  }

  &:hover {
    border-top-color: rgb(255, 105, 0);
    border-left-color: rgb(255, 105, 0);
  }
`;

export const PrevButton = styled(SwiperButton)`
  left: 4rem;
  transform: rotate(-45deg) translateY(-50%);
`;

export const NextButton = styled(SwiperButton)`
  right: 4rem;
  transform: rotate(135deg) translateY(-50%);
`;
