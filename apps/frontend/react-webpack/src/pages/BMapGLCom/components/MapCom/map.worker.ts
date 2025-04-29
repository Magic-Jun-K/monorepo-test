type WorkerMessage = { type: 'generatePoints'; count: number; bounds: [number, number, number, number] } | { type: 'destroy' };

const generateRandomCoordinates = (minLng: number, maxLng: number, minLat: number, maxLat: number, count: number) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push({
      lng: minLng + Math.random() * (maxLng - minLng),
      lat: minLat + Math.random() * (maxLat - minLat)
    });
  }
  return points;
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === 'generatePoints') {
    const {
      count,
      bounds: [minLng, maxLng, minLat, maxLat]
    } = e.data;

    // 一次性生成全部数据
    const points = generateRandomCoordinates(minLng, maxLng, minLat, maxLat, count);

    // 单次发送完整数据
    self.postMessage({
      type: 'pointsComplete',
      points: points
    });
  }

  if (e.data.type === 'destroy') {
    self.close();
  }
};
