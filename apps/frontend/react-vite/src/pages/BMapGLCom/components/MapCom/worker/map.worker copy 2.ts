type WorkerMessage = { type: 'generatePoints'; count: number; bounds: [number, number, number, number] } | { type: 'destroy' };

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
    // 尝试多种方式加载WASM
    try {
      // 使用相对路径
      const response = await fetch('/wasm/release.wasm');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const buffer = await response.arrayBuffer();
      const module = await WebAssembly.compile(buffer);
      const instance = await WebAssembly.instantiate(module, importObject);

      wasmModule = instance.exports;
      console.log('WebAssembly模块加载成功');
    } catch (error1) {
      console.error('加载失败:', error1);

      // 方法2: 尝试使用绝对路径
      try {
        const response = await fetch(location.origin + '/wasm/release.wasm');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const buffer = await response.arrayBuffer();
        const module = await WebAssembly.compile(buffer);
        const instance = await WebAssembly.instantiate(module, importObject);

        wasmModule = instance.exports;
        console.log('WebAssembly模块加载成功 (方法2)');
      } catch (error2) {
        console.error('方法2加载失败:', error2);
        throw error2;
      }
    }
  } catch (error) {
    console.error('所有WebAssembly加载方法都失败:', error);
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

    // 获取内存指针
    const ptrOrArray = generatePointsFunc(count, minLng, maxLng, minLat, maxLat);
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

    // console.log('解析后的数据:', pointsArray);

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

    console.log('转换后的点数据示例:', points.slice(0, 5));
    return points;
  } catch (error) {
    console.error('调用WASM函数出错:', error);
    return generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
  }
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  if (e.data.type === 'generatePoints') {
    const {
      count,
      bounds: [minLng, maxLng, minLat, maxLat]
    } = e.data;

    // 检查wasmModule状态
    console.log('WebAssembly模块状态:', wasmModule ? '已加载' : '未加载');

    // 一次性生成全部数据
    // const points = generateRandomCoordinates(minLng, maxLng, minLat, maxLat, count);
    // 使用WASM或备用JS生成点
    const points = wasmModule
      ? generateRandomCoordinatesWasm(minLng, maxLng, minLat, maxLat, count)
      : generateRandomCoordinatesJS(minLng, maxLng, minLat, maxLat, count);
    console.log('🚀 ~ file: map.worker.ts:100 ~ self.onmessage ~ points:', points);

    // 单次发送完整数据
    self.postMessage({
      type: 'pointsComplete',
      points: points
    });
    // self.postMessage(
    //   { type: 'pointsComplete', points: Float32Array },
    //   { transfer: [Float32Array] } // 使用 WindowPostMessageOptions 传输
    // );
  }

  if (e.data.type === 'destroy') {
    self.close();
  }
};
