import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface LayoutContextProps {
  searchHeight: number;
  updateSearchHeight: (height: number) => void;
}

export const LayoutContext = createContext<LayoutContextProps>({
  searchHeight: 0,
  // updateSearchHeight: (height: number) => {}
  updateSearchHeight: () => {}
} as LayoutContextProps);

export const LayoutProvider = ({ children }: { children: React.ReactNode }) => {
  // 使用非零初始值，确保有一个有效的初始高度
  const [searchHeight, setSearchHeight] = useState(0);
  const [initialized, setInitialized] = useState(false);
  
  // 添加调试日志，监控searchHeight的变化
  useEffect(() => {
    if (searchHeight > 0 && !initialized) {
      setInitialized(true);
    }
    console.log('LayoutContext - searchHeight更新为:', searchHeight, '初始化状态:', initialized);
  }, [searchHeight, initialized]);
  
  // 使用useCallback包装updateSearchHeight函数，避免不必要的重渲染
  const updateSearchHeightWithLog = useCallback((height: number) => {
    console.log('LayoutContext - 调用updateSearchHeight:', height);
    if (height > 0) { // 只在高度大于0时更新，避免无效值
      setSearchHeight(height);
    }
  }, []);
  
  // 确保context值不会因为组件重渲染而变化
  const contextValue = React.useMemo(() => ({
    searchHeight,
    updateSearchHeight: updateSearchHeightWithLog
  }), [searchHeight, updateSearchHeightWithLog]);
  
  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutContext = () => useContext(LayoutContext);