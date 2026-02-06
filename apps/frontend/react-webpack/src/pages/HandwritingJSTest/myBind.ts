/* eslint-disable no-extend-native -- Educational code for demonstrating Function.prototype.myBind */

declare global {
  interface Function {
    myBind<T, BoundArgs extends unknown[], Args extends unknown[], Return>(
      this: ThisFunction<T, BoundArgs, Args, Return>,
      context: T,
      ...boundArgs: BoundArgs
    ): BoundFunction<Args, Return>;
  }
}

// 辅助类型定义
type ThisFunction<T, BoundArgs extends unknown[], Args extends unknown[], Return> = (
  this: T,
  ...args: [...BoundArgs, ...Args]
) => Return;

type BoundFunction<Args extends unknown[], Return> = {
  (...args: Args): Return;
  new (...args: Args): Return;
};

Function.prototype.myBind = function <
  T,
  BoundArgs extends unknown[],
  Args extends unknown[],
  Return,
>(
  this: ThisFunction<T, BoundArgs, Args, Return>,
  context: T,
  ...boundArgs: BoundArgs
): BoundFunction<Args, Return> {
  // 定义绑定函数（支持 new 调用）
  const boundFn = function (this: unknown, ...args: Args) {
    const isNewCall = new.target !== undefined;

    return (this as ThisFunction<T, BoundArgs, Args, Return>).apply(isNewCall ? this : context, [
      ...boundArgs,
      ...args,
    ]);
  } as BoundFunction<Args, Return>;

  // 维护原型链
  if (typeof this.prototype !== 'undefined') {
    boundFn.prototype = Object.create(this.prototype);
    Object.defineProperty(boundFn.prototype, 'constructor', {
      value: boundFn,
      enumerable: false,
      writable: true,
      configurable: true,
    });
  }

  return boundFn;
};
