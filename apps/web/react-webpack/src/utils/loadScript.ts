interface ScriptOptions {
  src: string;
  integrity?: string;
  crossorigin?: string;
  type?: string;
}

// 添加一个Map来缓存脚本加载的Promise
const scriptCache = new Map<string, Promise<void>>();

export const loadScript = (options: ScriptOptions): Promise<void> => {
  const { src, integrity, crossorigin, type } = options;

  // 检查缓存中是否已有该脚本的Promise
  if (scriptCache.has(src)) {
    console.log('脚本已在缓存中:', src);
    return scriptCache.get(src)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    console.log('测试existingScript', existingScript);
    if (existingScript) {
      resolve(); // 如果脚本已经存在，直接 resolve
      return;
    }

    const script = document.createElement('script');
    Object.assign(script, {
      type: type || 'text/javascript',
      src,
      async: true,
      ...(integrity && { integrity }),
      ...(crossorigin && { crossOrigin: crossorigin })
    });
    script.addEventListener('load', () => {
      console.log('脚本加载完成');
      resolve();
    });
    script.addEventListener('error', (err) => {
      console.error('脚本加载失败:', src, err);
      // 从缓存中删除失败的脚本
      scriptCache.delete(src);
      reject(err);
    });
    document.head.appendChild(script);
  });

  // 将Promise存入缓存
  scriptCache.set(src, promise);
  return promise;
};
