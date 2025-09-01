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
export function debounce<T extends any[]>(func: (...args: T) => void, wait: number, options: DebounceOptions = {}): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isLeadingCalled = false; // 用于记录是否已经执行过 leading 调用

  return function (this: unknown, ...args: T) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this;

    // 立即执行相关逻辑
    const callImmediately = options.leading && !isLeadingCalled;

    // 清除已有定时器
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // 处理 leading 立即执行
    if (callImmediately) {
      func.apply(context, args);
      isLeadingCalled = true;
    }

    // 设置新的定时器
    timeoutId = setTimeout(() => {
      // 如果不是 leading 模式，则执行末尾调用
      if (!options.leading) {
        func.apply(context, args);
      }
      // 处理 leading 模式下的末尾调用保护
      else if (!isLeadingCalled) {
        func.apply(context, args);
      }
      timeoutId = null;
      isLeadingCalled = false; // 重置 leading 状态
    }, wait);
  };
}
