declare global {
  interface Function {
    myApply<T, Args extends unknown[], Return>(
      this: (this: T, ...args: Args) => Return,
      context: T | null | undefined,
      args?: Args
    ): Return;
  }
}

Function.prototype.myApply = function <T, Args extends unknown[], Return>(
  this: (this: T, ...args: Args) => Return,
  context: T | null | undefined,
  args?: Args
): Return {
  const ctx = context ?? globalThis;
  const safeContext = typeof ctx === 'object' ? ctx : Object(ctx);

  const key = Symbol.for('ts_myApply_temp');
  try {
    safeContext[key] = this;

    // 使用双重类型断言
    const finalArgs = args ?? ([] as unknown as Args);
    const result = (safeContext[key] as typeof this)(...finalArgs);
    return result;
  } finally {
    delete safeContext[key];
  }
};
