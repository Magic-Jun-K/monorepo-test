// // 生成随机坐标点的函数
// export function generateRandomPoints(count: i32, minLng: f64, maxLng: f64, minLat: f64, maxLat: f64): Float64Array {
//   // 创建结果数组，每个点有两个坐标值(lng, lat)
//   const result = new Float64Array(count * 2);

//   for (let i = 0; i < count; i++) {
//     // 生成随机经度
//     const lng = minLng + Math.random() * (maxLng - minLng);
//     // 生成随机纬度
//     const lat = minLat + Math.random() * (maxLat - minLat);

//     // 存储到结果数组
//     result[i * 2] = lng;
//     result[i * 2 + 1] = lat;
//   }

//   return result;
// }

// 生成随机坐标点的函数 - 最简化版本
export function generateRandomPoints(
  count: i32,
  minLng: f64,
  maxLng: f64,
  minLat: f64,
  maxLat: f64
): Float64Array {
  // 创建结果数组
  const result = new Float64Array(count * 2);

  for (let i = 0; i < count; i++) {
    // 使用简单的确定性算法生成坐标
    const lng = minLng + (f64(i) / f64(count)) * (maxLng - minLng);
    const lat = minLat + (f64(i % 100) / 100.0) * (maxLat - minLat);

    // 存储到结果数组
    result[i * 2] = lng;
    result[i * 2 + 1] = lat;
  }

  return result;
}
