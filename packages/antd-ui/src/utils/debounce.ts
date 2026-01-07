interface DebounceOptions {
  leading?: boolean; // 是否在延迟开始前立即执行
}

/**
 * 防抖函数，返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 * @param func 需要防抖的函数
 * @param wait 延迟毫秒数
 * @param options 配置选项
 * @returns 返回防抖后的函数
 */
export function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  wait: number,
  options: DebounceOptions = {},
): (...args: T) => void {
  let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
  let isLeadingCalled = false;

  return function (this: unknown, ...args: T) {
    const callImmediately = options.leading && !isLeadingCalled;

    if (timeoutId) {
      globalThis.clearTimeout(timeoutId);
    }

    if (callImmediately) {
      func.apply(this, args);
      isLeadingCalled = true;
    }

    timeoutId = globalThis.setTimeout(() => {
      if (!options.leading) {
        func.apply(this, args);
      } else if (!isLeadingCalled) {
        func.apply(this, args);
      }
      timeoutId = null;
      isLeadingCalled = false;
    }, wait);
  };
}
