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
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  margin: 0 24px;
  cursor: pointer;
  z-index: 1;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
