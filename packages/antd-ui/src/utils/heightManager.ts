type Listener = (height: number) => void;

export const heightManager = {
  currentHeight: 0,
  listeners: new Set<Listener>(),
  updateHeight(height: number) {
    console.log('[updateHeightImpl] 收到新高度:', height);
    this.currentHeight = height;
    this.listeners.forEach(fn => fn(height));
  },
  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
};
