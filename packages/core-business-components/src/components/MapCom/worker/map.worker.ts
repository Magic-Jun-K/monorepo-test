// 消息类型
type WorkerMessage =
  | {
      type: 'generatePoints';
      count: number;
      bounds: [number, number, number, number];
      batchSize?: number;
    }
  | { type: 'updateViewport'; viewport: [number, number, number, number] }
  | { type: 'destroy' }
  | { type: 'initWasm'; wasmUrl: string };

// 导入WebAssembly模块
type WasmExports = {
  generateRandomPoints?: (
    count: number,
    minLng: number,
    maxLng: number,
    minLat: number,
    maxLat: number,
  ) => number | Float64Array;
  generatePoints?: (
    count: number,
    minLng: number,
    maxLng: number,
    minLat: number,
    maxLat: number,
  ) => number | Float64Array;
  __getFloat64Array?: (ptr: number) => Float64Array;
  __getArray?: (ptr: number) => Float64Array;
  memory?: WebAssembly.Memory;
};

let wasmModule: WasmExports | null = null;

// 智能获取WASM URL的函数
async function getWasmUrl(fileName: string): Promise<string> {
  // 尝试多种路径加载WASM文件
  const pathsToTry = [
    `/wasm/${fileName}`, // 默认路径
    `/core-business-components/wasm/${fileName}`, // 包路径
    `./wasm/${fileName}`, // 相对路径
    fileName, // 相对路径
  ];

  for (const path of pathsToTry) {
    try {
      // 对于绝对路径，构造完整URL
      let url: string;
      if (path.startsWith('/')) {
        // 在Worker中，我们可以通过location获取origin
        // 注意：Worker中的location与主窗口不同，需要特殊处理
        // url = `http://localhost:3000${path}`; // 默认开发服务器地址
        url = `${self.location.origin}${path}`;
      } else {
        url = path;
      }

      // 检查文件是否存在
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        console.log(`找到WASM文件: ${url}`);
        return url.startsWith('http') ? url : `http://localhost:3000${path}`;
        // return url;
      }
    } catch (e) {
      console.warn(`尝试路径 ${path} 失败:`, e);
    }
  }

  // 如果所有路径都失败，抛出错误
  throw new Error(`无法找到 WASM 文件: ${fileName}`);
}

// 加载WebAssembly模块
async function loadWasm(wasmUrl?: string) {
  try {
    const importObject = {
      env: {
        abort: (msg: number, file: number, line: number, column: number) => {
          console.error('AssemblyScript中止:', { msg, file, line, column });
        },
      },
    };

    // 如果提供了URL，直接使用
    if (wasmUrl) {
      console.log('尝试加载WASM文件:', wasmUrl);
      const response = await fetch(wasmUrl);
      if (!response.ok) {
        throw new Error(`fetch failed with status ${response.status}: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const module = await WebAssembly.compile(buffer);
      const instance = await WebAssembly.instantiate(module, importObject);
      wasmModule = instance.exports;
      console.log(`WebAssembly模块加载成功: ${wasmUrl}`);
      return;
    }

    // 如果没有提供URL，尝试智能加载
    try {
      const url = await getWasmUrl('release.wasm');
      console.log('尝试加载WASM文件:', url);
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.compile(buffer);
        const instance = await WebAssembly.instantiate(module, importObject);
        wasmModule = instance.exports;
        console.log(`WebAssembly模块加载成功: ${url}`);
        return;
      }
    } catch (error) {
      console.warn('智能加载WASM失败:', error);
    }

    throw new Error('所有WebAssembly加载路径都失败');
  } catch (error) {
    console.warn('WebAssembly加载失败，将使用JavaScript实现:', error);
    // 如果WASM加载失败，使用备用的JS实现
    wasmModule = null;
  }
}

// 备用的JS实现，当WASM加载失败时使用
const generateRandomCoordinatesJS = (
  minLng: number,
  maxLng: number,
  minLat: number,
  maxLat: number,
  count: number,
) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    points.push({
      lng: minLng + Math.random() * (maxLng - minLng),
      lat: minLat + Math.random() * (maxLat - minLat),
    });
  }
  return points;
};

// 使用WASM生成坐标点
const generateRandomCoordinatesWasm = (
  minLng: number,
  maxLng: number,
  minLat: number,
  maxLat: number,
  count: number,
) => {
  if (count <= 0) return []; // ← 就加在这里

  // 检查WASM是否可用且稳定
  if (!wasmModule || !wasmModule.generateRandomPoints) {
    console.warn('WASM不可用，使用JS实现');
    return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
  }

  // 对于小数量，直接使用JS实现（更稳定）
  if (count <= 500) {
    // 降低阈值到500
    return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
  }

  try {
    // 参数验证和限制
    const safeCount = Math.min(count, 50000); // 降低单次WASM调用限制到5万
    const safeMinLng = Number.isFinite(minLng) ? minLng : 0;
    const safeMaxLng = Number.isFinite(maxLng) ? maxLng : 180;
    const safeMinLat = Number.isFinite(minLat) ? minLat : 0;
    const safeMaxLat = Number.isFinite(maxLat) ? maxLat : 90;

    // 调用WASM函数，返回内存指针
    const ptr = wasmModule.generateRandomPoints(
      safeCount,
      safeMinLng,
      safeMaxLng,
      safeMinLat,
      safeMaxLat,
    );

    if (typeof ptr !== 'number' || ptr === 0) {
      console.error('WASM函数返回无效指针');
      return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
    }

    // 从内存中读取Float64Array
    if (!wasmModule.memory) {
      console.error('WASM内存不可用');
      return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
    }

    const memory = wasmModule.memory.buffer;

    // 检查内存边界
    if (ptr < 0 || ptr >= memory.byteLength - 8) {
      console.error(`内存指针超出范围: ${ptr}, 内存大小: ${memory.byteLength}`);
      return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
    }

    // 直接使用期望的长度
    const expectedLength = safeCount * 2;

    // 检查是否有足够的内存空间
    const dataStart = ptr;
    const dataEnd = dataStart + expectedLength * 8;
    if (dataEnd > memory.byteLength) {
      console.error(`数据超出内存范围: ${dataEnd} > ${memory.byteLength}`);
      return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
    }

    // 直接读取数据
    const pointsArray = new Float64Array(memory, dataStart, expectedLength);

    // 将Float64Array转换为对象数组
    const points = [];
    const actualCount = Math.min(safeCount, Math.floor(pointsArray.length / 2));

    console.log('实际处理点数:', actualCount);

    for (let i = 0; i < actualCount; i++) {
      const lng = pointsArray[i * 2];
      const lat = pointsArray[i * 2 + 1];

      // 检查坐标值是否有效
      if (
        typeof lng !== 'number' ||
        typeof lat !== 'number' ||
        Number.isNaN(lng) ||
        Number.isNaN(lat) ||
        lng < -180 ||
        lng > 180 ||
        lat < -90 ||
        lat > 90
      ) {
        console.warn(`无效的坐标点 [${i}]: (${lng}, ${lat})`);
        points.push({
          lng: safeMinLng + Math.random() * (safeMaxLng - safeMinLng),
          lat: safeMinLat + Math.random() * (safeMaxLat - safeMinLat),
        });
      } else {
        points.push({ lng, lat });
      }
    }

    // 如果WASM生成了部分数据，继续用WASM补齐剩余部分
    const remaining = count - actualCount;

    if (remaining > 0 && remaining < count && actualCount > 0) {
      // 只有在递归参数完全正常时才递归
      const remainingPoints: { lng: number; lat: number }[] = generateRandomCoordinatesWasm(
        minLng,
        maxLng,
        minLat,
        maxLat,
        remaining,
      );
      points.push(...remainingPoints);
    } else if (remaining > 0) {
      // 只要递归参数异常，直接用JS补齐
      const jsPoints = generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, remaining);
      points.push(...jsPoints);
    }

    return points;
  } catch (error) {
    console.error('WASM调用失败，回退到JS实现:', error);
    return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
  }
};

// 存储当前视口
let currentViewport: [number, number, number, number] | null = null;

let wasmUrlFromMain: string | null = null;

// 修改点生成函数，优先生成视口内的点 - 以WASM为主
const generatePointsWithViewportPriority = (
  minLng: number,
  maxLng: number,
  minLat: number,
  maxLat: number,
  count: number,
  viewport: [number, number, number, number] | null,
) => {
  if (count <= 0) return [];

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
  const viewportArea =
    (effectiveViewMaxLng - effectiveViewMinLng) * (effectiveViewMaxLat - effectiveViewMinLat);
  const viewportRatio = totalArea > 0 ? viewportArea / totalArea : 0;

  // 视口内点数，至少生成一些点在视口内
  let viewportPointCount = Math.max(Math.round(count * viewportRatio * 3), Math.min(2000, count)); // 恢复原来的视口内点数比例
  viewportPointCount = Math.min(viewportPointCount, count); // 防止超出总数
  const outsidePointCount = count - viewportPointCount;

  // 生成视口内的点 - 优先使用WASM
  const viewportPoints = wasmModule
    ? generateRandomCoordinatesWasm(
        effectiveViewMinLng,
        effectiveViewMaxLng,
        effectiveViewMinLat,
        effectiveViewMaxLat,
        viewportPointCount,
      )
    : generateRandomCoordinatesJS(
        effectiveViewMinLng,
        effectiveViewMaxLng,
        effectiveViewMinLat,
        effectiveViewMaxLat,
        viewportPointCount,
      );

  // 生成视口外的点 - 优先使用WASM
  const outsidePoints = wasmModule
    ? generateRandomCoordinatesWasm(minLng, maxLng, minLat, maxLat, outsidePointCount)
    : generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, outsidePointCount);

  // 合并结果
  return [...viewportPoints, ...outsidePoints];
};

// ESM Worker 导出方式
// export default function worker(self: DedicatedWorkerGlobalScope) {
console.log('Worker started!');

self.addEventListener('message', (e: MessageEvent) => {
  const data = e.data as WorkerMessage;
  if (data.type === 'initWasm' && data.wasmUrl) {
    wasmUrlFromMain = data.wasmUrl;
    loadWasm(wasmUrlFromMain);
    return;
  }

  console.log('Worker received:', data);
  if (data.type === 'generatePoints') {
    const {
      count,
      bounds: [minLng, maxLng, minLat, maxLat],
      batchSize = 50000,
    } = data;

    const batchCount = Math.ceil(count / batchSize);

    (async () => {
      const totalStart = performance.now();
      for (let batch = 0; batch < batchCount; batch++) {
        const startIdx = batch * batchSize;
        const currentBatchSize = Math.min(batchSize, count - startIdx);

        if (currentBatchSize <= 0) continue;

        const batchStart = performance.now();

        const batchPoints: { lng: number; lat: number }[] = generatePointsWithViewportPriority(
          minLng,
          maxLng,
          minLat,
          maxLat,
          currentBatchSize,
          currentViewport,
        );

        const batchEnd = performance.now();
        console.log(`批次 ${batch + 1} 数据生成耗时: ${batchEnd - batchStart}ms`);

        const pointsBuffer = new Float64Array(currentBatchSize * 2);
        for (let i = 0; i < currentBatchSize; i++) {
          pointsBuffer[i * 2] = batchPoints[i]?.lng ?? 0;
          pointsBuffer[i * 2 + 1] = batchPoints[i]?.lat ?? 0;
        }

        self.postMessage(
          {
            type: 'pointsBatch',
            buffer: pointsBuffer.buffer,
            count: currentBatchSize,
            isLastBatch: batch === batchCount - 1,
          },
          { transfer: [pointsBuffer.buffer] },
        );

        if (batch < batchCount - 1) {
          const delay = batch < 10 ? 0 : 1;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      const totalEnd = performance.now();
      console.log(`所有批次数据生成完成，总耗时: ${totalEnd - totalStart}ms`);
    })();
  }

  if (data.type === 'updateViewport') {
    currentViewport = data.viewport;
  }

  if (data.type === 'destroy') {
    self.close();
  }
});
// }
