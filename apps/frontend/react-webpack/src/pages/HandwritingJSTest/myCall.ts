/* eslint-disable no-extend-native -- Educational code for demonstrating Function.prototype.myCall */

declare global {
  interface Function {
    // 使用泛型定义（T=上下文类型，Args=参数类型，ReturnType=返回值类型）
    myCall<T, Args extends unknown[], ReturnType>(
      this: (...args: Args) => ReturnType, // 关键：通过 this 参数限定函数类型
      context: T | null | undefined,
      ...args: Args
    ): ReturnType;
  }
}

Function.prototype.myCall = function <T, Args extends unknown[], ReturnType>(
  this: (...args: Args) => ReturnType,
  context: T | null | undefined,
  ...args: Args
): ReturnType {
  console.log('this:', this);
  console.log('context:', context);
  console.log('args:', args);
  // 处理 context 为 null/undefined 的情况
  const ctx = context ?? globalThis;

  // 确保 ctx 是对象（Symbol 只能作为对象属性）
  const safeContext = typeof ctx === 'object' ? ctx : Object(ctx);

  const key = Symbol('tempFn');
  safeContext[key] = this;

  // 执行并捕获结果（通过类型断言保证安全）
  const result = safeContext[key](...args) as ReturnType;
  delete safeContext[key];

  return result;
};
