/**
 * LRU (Least Recently Used) 缓存实现
 * 使用Map数据结构，保持插入顺序，便于实现LRU算法
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly maxSize: number;

  /**
   * 创建LRU缓存实例
   * @param maxSize 缓存最大容量
   */
  constructor(maxSize: number) {
    this.cache = new Map<K, V>();
    this.maxSize = maxSize;
  }

  /**
   * 获取缓存项
   * @param key 键
   * @returns 值或undefined（如果不存在）
   */
  get(key: K): V | undefined {
    // 如果键不存在，返回undefined
    if (!this.cache.has(key)) {
      return undefined;
    }

    // 获取值
    const value = this.cache.get(key);

    // 删除旧位置的键值对
    this.cache.delete(key);
    // 将键值对重新插入到Map末尾（最近使用）
    this.cache.set(key, value!);

    return value;
  }

  /**
   * 设置缓存项
   * @param key 键
   * @param value 值
   */
  set(key: K, value: V): void {
    // 如果键已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 如果缓存已满，删除最久未使用的项（Map的第一个元素）
    else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    // 将新键值对添加到Map末尾
    this.cache.set(key, value);
  }

  /**
   * 检查键是否存在于缓存中
   * @param key 键
   * @returns 是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * 从缓存中删除项
   * @param key 键
   * @returns 是否成功删除
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有缓存键
   */
  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  /**
   * 获取所有缓存值
   */
  values(): IterableIterator<V> {
    return this.cache.values();
  }

  /**
   * 获取所有缓存项
   */
  entries(): IterableIterator<[K, V]> {
    return this.cache.entries();
  }
}
