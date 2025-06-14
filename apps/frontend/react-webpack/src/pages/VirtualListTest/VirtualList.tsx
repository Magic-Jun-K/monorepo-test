import { FC, UIEvent, useRef, useState, useEffect } from 'react';

import styles from './index.module.scss';

interface Item {
  id: number;
  text: string;
}

const itemHeight = 50; // 每项高度
const buffer = 5; // 减小缓冲区大小，避免加载过多数据
const initialItemCount = 20; // 初始加载的数据量
const loadMoreThreshold = 100; // 触发加载的阈值（距离底部多少像素时触发加载）
const totalDataLimit = 100; // 总数据量限制

// 生成随机文本的函数
const generateRandomText = (index: number): string => {
  const templates: string[] = [
    `这是第 ${index} 项，一个简短的描述`,
    `项目 ${index}: 这是一个中等长度的描述文本，包含一些基本的信息`,
    `第 ${index} 项 - 这是一个较长的描述文本，可能会包含更多的细节和说明，用于测试文本换行和显示效果`,
    `Item ${index}: This is a sample text with mixed content and some English words`,
    `项目 ${index} 的详细说明：这是一个包含多个句子的长文本，用于测试虚拟列表的显示效果和性能表现。这里可以包含更多的内容来测试文本的换行和截断效果。`
  ];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex] as string;
};

const VirtualList: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalItems, setTotalItems] = useState(0); // 数据总数，初始值设为0，等待计算
  const [visibleItems, setVisibleItems] = useState<number[]>([]); // 可见的项索引
  const [items, setItems] = useState<Item[]>([]); // 数据项
  const [isLoading, setIsLoading] = useState(false); // 加载状态
  const [hasMore, setHasMore] = useState(true); // 是否还有更多数据
  const [scrollTop, setScrollTop] = useState(0); // 添加滚动位置状态
  const [isInitialized, setIsInitialized] = useState(false); // 初始化状态

  // 计算初始数据量
  const calculateInitialItemCount = () => {
    if (!containerRef.current) return initialItemCount;
    
    // 获取容器高度
    const containerHeight = containerRef.current.clientHeight;
    // 计算可以显示的项目数量，并向上取整
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    // 确保至少有 initialItemCount 个项目，并且是 10 的倍数
    return Math.max(initialItemCount, Math.ceil(visibleCount / 10) * 10);
  };

  // 初始化数据
  const initializeData = () => {
    const count = calculateInitialItemCount();
    const initialItems: Item[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      text: generateRandomText(i)
    }));
    setItems(initialItems);
    setTotalItems(count);
    setIsInitialized(true);
  };

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (!isInitialized) return;

      // 重新计算可见项
      const container = containerRef.current;
      if (!container) return;

      // 获取容器高度
      const containerHeight = container.clientHeight;
      // 获取起始索引
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
      // 计算可见项数量
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      // 获取结束索引
      const endIndex = Math.min(totalItems, startIndex + visibleCount + buffer);

      // 设置可见项
      const visibleIndices = Array.from(
        { length: endIndex - startIndex },
        (_, i) => startIndex + i
      );
      setVisibleItems(visibleIndices);

      // 检查是否需要加载更多数据
      if (items.length < totalDataLimit && !isLoading && hasMore) {
        const scrollHeight = container.scrollHeight; // 获取滚动高度
        const clientHeight = container.clientHeight; // 获取容器高度
        const scrollBottom = scrollHeight - scrollTop - clientHeight; // 获取滚动底部位置

        // 触发加载更多数据
        if (scrollBottom < loadMoreThreshold) {
          loadMoreData();
        }
      }
    };

    // 初始化数据
    if (!isInitialized) {
      initializeData();
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized, scrollTop, items.length, isLoading, hasMore]);

  // 计算可见范围
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 获取容器高度
    const containerHeight = container.clientHeight;
    // 获取起始索引计算，确保能正确显示所有数据
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight));
    // 计算确保能正确显示所有数据
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    // 计算结束索引
    const endIndex = Math.min(totalItems, startIndex + visibleCount + buffer);

    // 设置可见项
    const visibleIndices = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
    setVisibleItems(visibleIndices);
  }, [totalItems, itemHeight, buffer, scrollTop]);

  // 动态加载数据
  const loadMoreData = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newItems = await fetchData();
      if (newItems.length === 0) {
        setHasMore(false);
        return;
      }

      setItems(prev => [...prev, ...newItems]);
      setTotalItems(prev => prev + newItems.length);

      // 检查是否达到数据限制
      if (items.length + newItems.length >= totalDataLimit) {
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 滚动事件处理
  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const currentScrollTop = container.scrollTop; // 获取滚动位置
    setScrollTop(currentScrollTop); // 更新滚动位置

    // 加载更多数据的触发条件
    const scrollHeight = container.scrollHeight; // 获取滚动高度
    const clientHeight = container.clientHeight; // 获取容器高度
    // 获取滚动底部位置
    const scrollBottom = scrollHeight - currentScrollTop - clientHeight;

    // 触发加载更多数据
    if (scrollBottom < loadMoreThreshold && !isLoading && hasMore) {
      loadMoreData();
    }
  };

  const fetchData = async (): Promise<Item[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const currentLength = items.length; // 当前数据长度
        const remainingItems = totalDataLimit - currentLength; // 剩余数据长度

        // 如果剩余数据不足10条，就只加载剩余的数据
        const newItemCount = Math.min(10, remainingItems);

        if (newItemCount <= 0) {
          resolve([]);
          return;
        }

        // 生成新的数据项
        const newItems: Item[] = Array.from({ length: newItemCount }, (_, i) => ({
          id: currentLength + i,
          text: generateRandomText(currentLength + i)
        }));
        resolve(newItems); // 返回新的数据项
      }, 500);
    });
  };

  // 计算加载动画的位置
  const getLoadingPosition = () => {
    if (!isLoading) return 0;
    // 计算当前可见的最后一项的位置
    const lastVisibleIndex = Math.max(...visibleItems);
    return lastVisibleIndex * itemHeight;
  };

  return (
    <div ref={containerRef} className={styles.virtualListContainer} onScroll={handleScroll}>
      {/* 占位元素，高度根据实际加载的数据量动态计算 */}
      <div style={{ height: `${totalItems * itemHeight}px` }} />

      {/* 实际渲染的列表项 */}
      <div
        className={styles.listContainer}
        style={{
          transform: `translateY(${Math.floor(scrollTop / itemHeight) * itemHeight}px)`
        }}
      >
        {visibleItems.map(index => {
          const item = items[index];
          if (!item) return null;

          return (
            <div key={item.id} className={styles.listItem} style={{ height: `${itemHeight}px` }}>
              {item.text}
            </div>
          );
        })}
      </div>

      {/* 加载状态提示 */}
      {isLoading && (
        <div className={styles.loadingContainer} style={{ top: `${getLoadingPosition()}px` }}>
          <div className={styles.loadingSpinner} />
        </div>
      )}

      {/* 没有更多数据提示 */}
      {!hasMore && items.length > 0 && (
        <div
          className={styles.noMoreData}
          style={{ top: `${(totalItems - 1) * itemHeight + itemHeight}px` }}
        >
          没有更多数据了
        </div>
      )}
    </div>
  );
};

export default VirtualList;
