// 生成随机坐标
export const generateRandomCoordinates = (minLng: number, maxLng: number, minLat: number, maxLat: number, count: number) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    const lng = Math.random() * (maxLng - minLng) + minLng;
    const lat = Math.random() * (maxLat - minLat) + minLat;
    points.push({ lng, lat });
  }
  return points;
};
