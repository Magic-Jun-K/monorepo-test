type Listener = (height: number) => void;

export const heightManager = {
  currentHeight: 0, // 存储当前高度
  listeners: new Set<Listener>(), // 存储所有订阅者的集合
  // 发布新高度给所有订阅者
  updateHeight(height: number) {
    // console.log('[updateHeightImpl] 收到新高度:', height);
    this.currentHeight = height;
    this.listeners.forEach(fn => fn(height));
  },
  // 订阅高度变化
  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
};
