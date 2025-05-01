// 消息类型
type WorkerMessage =
  | { type: 'generatePoints'; count: number; bounds: [number, number, number, number]; batchSize?: number }
  | { type: 'updateViewport'; viewport: [number, number, number, number] }
  | { type: 'destroy' };

// 导入WebAssembly模块
// 注意：这里使用相对路径，Worker的基础路径是项目根目录
let wasmModule: any = null;

// 加载WebAssembly模块
async function loadWasm() {
  try {
    // 创建WebAssembly导入对象，提供所需的函数
    const importObject = {
      env: {
        // 提供abort函数用于错误处理
        abort: (msg: number, file: number, line: number, column: number) => {
          console.error('AssemblyScript中止:', { msg, file, line, column });
        },
        // 提供seed函数用于随机数生成
        seed: () => {
          // 返回一个随机的浮点数作为种子
          return Math.random();
        }
      }
    };
    // 尝试加载WASM - 简化路径处理逻辑
    const wasmPaths = ['/wasm/release.wasm', location.origin + '/wasm/release.wasm', './wasm/release.wasm'];

    let loaded = false;

    for (const path of wasmPaths) {
      try {
        const response = await fetch(path);
        if (!response.ok) continue;

        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.compile(buffer);
        const instance = await WebAssembly.instantiate(module, importObject);

        wasmModule = instance.exports;
        console.log(`WebAssembly模块加载成功: ${path}`);
        loaded = true;
        break;
      } catch (error) {
        console.warn(`路径 ${path} 加载失败:`, error);
      }
    }

    if (!loaded) {
      throw new Error('所有WebAssembly加载路径都失败');
    }
  } catch (error) {
    console.error('WebAssembly加载失败:', error);
    // 如果WASM加载失败，使用备用的JS实现
  }
}

// 加载WASM模块
loadWasm();

// 备用的JS实现，当WASM加载失败时使用
const generateRandomCoordinatesJS = (minLng: number, maxLng: number, minLat: number, maxLat: number, count: number) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push({
      lng: minLng + Math.random() * (maxLng - minLng),
      lat: minLat + Math.random() * (maxLat - minLat)
    });
  }
  return points;
};

// 使用WASM生成坐标点
const generateRandomCoordinatesWasm = (minLng: number, maxLng: number, minLat: number, maxLat: number, count: number) => {
  if (!wasmModule) {
    console.warn('WebAssembly模块未加载，使用JS实现');
    return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
  }

  // 检查导出的函数
  console.log('WebAssembly模块导出:', Object.keys(wasmModule));

  // 检查generateRandomPoints函数是否存在
  if (!wasmModule.generateRandomPoints && !wasmModule.generatePoints) {
    console.warn('WebAssembly模块中找不到生成点的函数，使用JS实现');
    return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
  }

  // 尝试使用正确的函数名
  const generatePointsFunc = wasmModule.generateRandomPoints || wasmModule.generatePoints;

  try {
    // 调用WASM函数生成点
    console.log('调用WASM函数，参数:', { count, minLng, maxLng, minLat, maxLat });

    // 参数验证和限制 - 防止传入可能导致WASM崩溃的值
    const safeCount = Math.min(count, 100000); // 限制单次生成数量
    const safeMinLng = Number.isFinite(minLng) ? minLng : 0;
    const safeMaxLng = Number.isFinite(maxLng) ? maxLng : 180;
    const safeMinLat = Number.isFinite(minLat) ? minLat : 0;
    const safeMaxLat = Number.isFinite(maxLat) ? maxLat : 90;

    // 获取内存指针
    const ptrOrArray = generatePointsFunc(safeCount, safeMinLng, safeMaxLng, safeMinLat, safeMaxLat);
    console.log('WASM返回值:', ptrOrArray);

    let pointsArray;

    // 检查返回值类型
    if (typeof ptrOrArray === 'number') {
      // 如果返回的是指针，需要从内存中读取数据
      console.log('WASM返回了内存指针:', ptrOrArray);

      // 检查是否有内存访问方法
      if (wasmModule.__getFloat64Array || wasmModule.__getArray || wasmModule.memory) {
        // 尝试使用AssemblyScript的辅助方法获取数组
        if (wasmModule.__getFloat64Array) {
          pointsArray = wasmModule.__getFloat64Array(ptrOrArray);
        } else if (wasmModule.__getArray) {
          pointsArray = wasmModule.__getArray(ptrOrArray);
        } else {
          // 手动从内存中读取Float64Array
          const memory = wasmModule.memory.buffer;
          // 添加边界检查
          if (ptrOrArray < 0 || ptrOrArray >= memory.byteLength) {
            throw new Error(`内存指针超出范围: ${ptrOrArray}, 内存大小: ${memory.byteLength}`);
          }
          pointsArray = new Float64Array(memory, ptrOrArray, count * 2);
        }
      } else {
        console.error('无法从WebAssembly内存中读取数据');
        return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
      }
    } else {
      // 如果直接返回了数组
      pointsArray = ptrOrArray;
    }

    // 检查返回的数据类型
    if (!pointsArray) {
      console.error('WASM函数返回null或undefined');
      return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
    }

    console.log('WASM返回数据类型:', pointsArray.constructor.name);
    console.log('WASM返回数据长度:', pointsArray.length);

    // 将Float64Array转换为对象数组
    const points = [];
    for (let i = 0; i < count; i++) {
      const lng = pointsArray[i * 2];
      const lat = pointsArray[i * 2 + 1];

      // 检查坐标值是否有效
      if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
        console.warn(`无效的坐标点 [${i}]: (${lng}, ${lat})`);
        // 使用有效的随机值替代
        points.push({
          lng: minLng + Math.random() * (maxLng - minLng),
          lat: minLat + Math.random() * (maxLat - minLat)
        });
      } else {
        points.push({ lng, lat });
      }
    }

    // 如果WASM只生成了部分数据，使用JS补齐剩余部分
    if (safeCount < count) {
      const remainingPoints = generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count - safeCount);
      points.push(...remainingPoints);
    }

    console.log('转换后的点数据示例:', points.slice(0, 5));
    return points;
  } catch (error) {
    console.error('调用WASM函数出错:', error);
    return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
  }
};

// 存储当前视口
let currentViewport: [number, number, number, number] | null = null;

// 在onmessage中处理视口更新
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === 'generatePoints') {
    // 现有的处理逻辑...
    const {
      count,
      bounds: [minLng, maxLng, minLat, maxLat],
      batchSize = 100000 // 默认批次大小
    } = e.data;

    // 计算需要的批次数
    const batchCount = Math.ceil(count / batchSize);

    // 异步处理每个批次
    (async () => {
      for (let batch = 0; batch < batchCount; batch++) {
        // 计算当前批次的起始索引和实际大小
        const startIdx = batch * batchSize;
        const currentBatchSize = Math.min(batchSize, count - startIdx);

        // 生成当前批次的点，考虑视口优先
        const batchPoints: { lng: number; lat: number }[] = generatePointsWithViewportPriority(
          minLng,
          maxLng,
          minLat,
          maxLat,
          currentBatchSize,
          currentViewport
        );

        // 创建TypedArray用于传输
        const pointsBuffer = new Float64Array(currentBatchSize * 2);
        for (let i = 0; i < currentBatchSize; i++) {
          pointsBuffer[i * 2] = batchPoints[i]?.lng ?? 0;
          pointsBuffer[i * 2 + 1] = batchPoints[i]?.lat ?? 0;
        }

        // 发送当前批次
        self.postMessage(
          {
            type: 'pointsBatch',
            buffer: pointsBuffer.buffer,
            count: currentBatchSize,
            batch,
            totalBatches: batchCount,
            isLastBatch: batch === batchCount - 1
          },
          { transfer: [pointsBuffer.buffer] }
        );

        // 如果不是最后一批，等待一小段时间让主线程有机会处理
        if (batch < batchCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    })();
  }

  if (e.data.type === 'updateViewport') {
    currentViewport = e.data.viewport;
    // 视口更新时不需要重新生成数据，只是记录当前视口
    // 下一批数据生成时会优先考虑这个视口
  }

  if (e.data.type === 'destroy') {
    self.close();
  }
};

// 修改点生成函数，优先生成视口内的点
const generatePointsWithViewportPriority = (
  minLng: number,
  maxLng: number,
  minLat: number,
  maxLat: number,
  count: number,
  viewport: [number, number, number, number] | null
) => {
  // 如果没有视口信息，使用普通生成
  if (!viewport) {
    return wasmModule
      ? generateRandomCoordinatesWasm(minLng, maxLng, minLat, maxLat, count)
      : generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
  }

  // 计算视口内应该生成的点数比例
  const [viewMinLng, viewMaxLng, viewMinLat, viewMaxLat] = viewport;

  // 确保视口在数据范围内
  const effectiveViewMinLng = Math.max(minLng, viewMinLng);
  const effectiveViewMaxLng = Math.min(maxLng, viewMaxLng);
  const effectiveViewMinLat = Math.max(minLat, viewMinLat);
  const effectiveViewMaxLat = Math.min(maxLat, viewMaxLat);

  // 计算视口占总区域的比例
  const totalArea = (maxLng - minLng) * (maxLat - minLat);
  const viewportArea = (effectiveViewMaxLng - effectiveViewMinLng) * (effectiveViewMaxLat - effectiveViewMinLat);
  const viewportRatio = viewportArea / totalArea;

  // 视口内点数，至少生成一些点在视口内
  const viewportPointCount = Math.max(Math.round(count * viewportRatio * 2), Math.min(1000, count));
  const outsidePointCount = count - viewportPointCount;

  // 生成视口内的点
  const viewportPoints = wasmModule
    ? generateRandomCoordinatesWasm(effectiveViewMinLng, effectiveViewMaxLng, effectiveViewMinLat, effectiveViewMaxLat, viewportPointCount)
    : generateRandomCoordinatesJS(effectiveViewMinLng, effectiveViewMaxLng, effectiveViewMinLat, effectiveViewMaxLat, viewportPointCount);

  // 生成视口外的点
  const outsidePoints = wasmModule
    ? generateRandomCoordinatesWasm(minLng, maxLng, minLat, maxLat, outsidePointCount)
    : generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, outsidePointCount);

  // 合并结果
  return [...viewportPoints, ...outsidePoints];
};
