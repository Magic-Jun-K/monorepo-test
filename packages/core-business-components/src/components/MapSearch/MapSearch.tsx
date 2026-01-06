import React, { useState, useEffect, useRef, useCallback } from 'react';

import { AutoComplete } from '@eggshell/antd-ui';

import type { MapInstance, LocalSearch, LocalResult, Marker } from '../../types/baiduMap';

import styles from './MapSearch.module.scss';

// 定义搜索结果类型
export interface PlaceResult {
  title: string;
  address: string;
  point: {
    lng: number;
    lat: number;
  };
}

interface AutoCompleteOption {
  title: string;
  address?: string;
  point?: {
    lng: number;
    lat: number;
  };
  label: string;
  value: string;
}

interface MapSearchProps {
  onSearchResult?: (results: PlaceResult[]) => void;
  onPlaceSelect?: (place: PlaceResult) => void;
}

export const MapSearch: React.FC<MapSearchProps> = ({ onSearchResult, onPlaceSelect }) => {
  // 搜索文本状态
  const [searchText, setSearchText] = useState('');
  // 自动完成选项
  const [autoCompleteOptions, setAutoCompleteOptions] = useState<AutoCompleteOption[]>([]);
  // 自动完成加载状态
  const [isLoading, setIsLoading] = useState(false);
  // 地图实例引用
  const mapInstanceRef = useRef<MapInstance | null>(null);
  // 标记数组引用
  const markersRef = useRef<Marker[]>([]);
  // 搜索服务引用
  const localSearchRef = useRef<LocalSearch | null>(null);
  // 搜索超时引用
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 上一次搜索文本引用
  const prevSearchTextRef = useRef<string>('');
  // 是否是用户主动选择地点的标志
  const isUserSelectingPlaceRef = useRef<boolean>(false);
  // 控制下拉框是否显示
  const [keepDropdownOpen, setKeepDropdownOpen] = useState<boolean>(false);

  // 清除地图上的标记
  const clearMarkers = () => {
    if (mapInstanceRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach((marker) => {
        mapInstanceRef.current!.removeOverlay(marker);
      });
      markersRef.current = [];
    }
  };

  // 获取地图实例
  useEffect(() => {
    const handleMapInstance = (event: CustomEvent) => {
      console.log('🔍 获取到地图实例');
      mapInstanceRef.current = event.detail;
      console.log('🔍 地图实例详情:', event.detail);
      console.log('🔍 地图实例类型:', typeof event.detail);
      console.log('🔍 地图实例是否有效:', !!event.detail);

      // 初始化百度地图搜索服务
      if (window.BMapGL && mapInstanceRef.current) {
        console.log('🔍 百度地图API已加载，开始初始化搜索服务');

        // 创建输入元素用于百度地图自动完成
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.visibility = 'hidden';
        document.body.appendChild(container);

        // 初始化LocalSearch用于地点搜索
        try {
          localSearchRef.current = new window.BMapGL.LocalSearch(mapInstanceRef.current, {
            onSearchComplete: (results: LocalResult) => {
              console.log('🔍 地点搜索完成回调');
              setIsLoading(false);

              // 只在搜索结果不为空时清除之前的标记
              if (results && results.getNumPois && results.getNumPois() > 0) {
                clearMarkers();

                console.log('🔍 搜索到结果数量:', results.getNumPois());
                const places: PlaceResult[] = [];
                const options = [];
                for (let i = 0; i < results.getNumPois(); i++) {
                  const poi = results.getPoi(i);
                  console.log('🔍 测试每个poi详情', poi);

                  if (poi) {
                    const newAddress = poi.address ? `(${poi.address})` : '';
                    const newTitle = `${poi.title || ''}${newAddress}`;
                    options.push({
                      ...poi,
                      title: newTitle,
                      label: newTitle,
                      value: newTitle,
                    });
                    places.push({
                      title: newTitle,
                      address: newTitle,
                      point: {
                        lng: poi.point ? poi.point.lng : 0,
                        lat: poi.point ? poi.point.lat : 0,
                      },
                    });
                  }
                }

                setAutoCompleteOptions(options);
                onSearchResult?.(places);
              } else {
                console.log('🔍 未搜索到结果');
              }
            },
          });
          console.log('🔍 LocalSearch初始化成功');
        } catch (error) {
          console.error('🔴 LocalSearch初始化失败:', error);
        }
      } else {
        console.log('🔴 百度地图API未加载或地图实例未就绪');
        console.log('🔴 window.BMapGL存在:', !!window.BMapGL);
        console.log('🔴 mapInstanceRef.current存在:', !!mapInstanceRef.current);
      }
    };

    console.log('🔍 添加地图实例监听器');
    window.addEventListener('mapInstanceReady', handleMapInstance as EventListener);

    // 检查地图实例是否已经就绪
    if (window.BMapGL && window.BMapGL.Map) {
      console.log('🔍 百度地图API已加载，但地图实例事件可能已经触发');
    }

    return () => {
      console.log('🔍 移除地图实例监听器');
      window.removeEventListener('mapInstanceReady', handleMapInstance as EventListener);
      // 清理搜索实例和标记
      if (localSearchRef.current) {
        localSearchRef.current.clearResults();
      }
      clearMarkers();

      // 清除定时器
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [onSearchResult]);

  // 处理地点搜索
  const handlePlaceSearch = useCallback(
    (value: string) => {
      console.log('执行百度地图地点搜索:', value);
      if (localSearchRef.current && value.trim().length > 0) {
        console.log('LocalSearch服务可用，开始搜索');
        setIsLoading(true);
        try {
          localSearchRef.current.search(value);
        } catch (error) {
          console.error('🔴 LocalSearch搜索出错:', error);
          setIsLoading(false);
          // 如果百度地图搜索失败，使用模拟数据
          const mockResults: PlaceResult[] = [
            {
              title: value,
              address: '广东省广州市黄埔区',
              point: {
                lng: 113.456,
                lat: 23.123,
              },
            },
          ];
          onSearchResult?.(mockResults);
        }
      } else {
        console.log('🔴 LocalSearch服务不可用或搜索词为空');
        // 如果百度地图搜索不可用，使用模拟数据
        if (value.trim().length > 0) {
          const mockResults: PlaceResult[] = [
            {
              title: value,
              address: '广东省广州市黄埔区',
              point: {
                lng: 113.456,
                lat: 23.123,
              },
            },
          ];
          onSearchResult?.(mockResults);
        }
      }
    },
    [localSearchRef, onSearchResult],
  );

  // 获取自动完成建议 - 使用useCallback优化避免不必要的重新创建
  const fetchAutoCompleteOptions = useCallback(
    (query: string) => {
      console.log('调用fetchAutoCompleteOptions，查询词:', query);

      // 如果是用户主动选择地点导致的文本变化，则不触发搜索
      if (isUserSelectingPlaceRef.current) {
        console.log('用户主动选择地点，跳过搜索请求');
        isUserSelectingPlaceRef.current = false;
        return;
      }

      // 如果查询词与上一次相同，则不重复请求
      if (query === prevSearchTextRef.current) {
        console.log('查询词与上次相同，跳过请求');
        return;
      }

      // 更新上一次查询词
      prevSearchTextRef.current = query;

      // 清除之前的定时器
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // 添加防抖逻辑，避免频繁搜索
      if (query.trim().length > 0) {
        // 在开始搜索时就打开下拉框，即使还没有结果
        setKeepDropdownOpen(true);
        searchTimeoutRef.current = setTimeout(() => {
          console.log('搜索关键词:', query);

          handlePlaceSearch(query);
        }, 300);
      } else {
        console.log('查询词为空，清空autoCompleteOptions');
        setAutoCompleteOptions([]);
        // 当查询词为空时，关闭下拉框
        setKeepDropdownOpen(false);
      }
    },
    [handlePlaceSearch],
  );

  // 提供降级建议
  // const provideFallbackSuggestions = (query: string) => {
  //   console.log('🟡 提供降级建议，查询词:', query);
  //   // 使用预定义的模拟数据作为降级方案
  //   const mockData: SuggestionItem[] = [
  //     { value: '黄埔公园', label: '黄埔公园', address: '广东省广州市黄埔区' }
  //   ]
  //     .filter(
  //       item =>
  //         item.label.includes(query) || item.address.includes(query)
  //     )
  //     .slice(0, 10);

  //   console.log('🟡 降级方案设置autoCompleteOptions:', mockData);
  //   setAutoCompleteOptions(mockData);
  // };

  // 处理自动完成选择
  const handleAutoCompleteSelect = (value: string, option: AutoCompleteOption) => {
    console.log('自动完成选择:', value, option);
    // 设置用户正在主动选择地点的标志
    isUserSelectingPlaceRef.current = true;
    // 直接处理地点选择，而不是执行搜索
    handleSelectPlace({
      title: String(option.label || option.value),
      address: option.address || '',
      point: option.point || {
        lng: 113.456,
        lat: 23.123,
      },
    });
    // 更新搜索文本
    setSearchText(String(option.label || option.value));
    // 不再清空自动完成选项，保持下拉框显示
    // setAutoCompleteOptions([]);
    // 设置保持下拉框打开状态
    setKeepDropdownOpen(true);
  };

  // 处理选择地点（用户从下拉列表中选择地点时调用）
  const handleSelectPlace = (place: PlaceResult) => {
    console.log('选择地点:', place);
    setSearchText(place.title);
    // 不再清空自动完成选项，保持下拉框显示
    // setAutoCompleteOptions([]);
    onPlaceSelect?.(place);

    // 将地图中心移动到选中的地点
    if (mapInstanceRef.current) {
      console.log('测试place.point', place.point);
      console.log('测试place.point.lng', place.point.lng);
      console.log('测试place.point.lat', place.point.lat);

      // 确保坐标有效
      if (
        !place.point ||
        typeof place.point.lng !== 'number' ||
        typeof place.point.lat !== 'number'
      ) {
        console.error('无效的地点坐标:', place.point);
        return;
      }

      const point = new window.BMapGL.Point(place.point.lng, place.point.lat);

      // 先设置缩放级别，再移动地图中心
      mapInstanceRef.current.setZoom(16);
      mapInstanceRef.current.panTo(point);

      console.log('地图已移动到:', point);
      console.log('当前缩放级别:', mapInstanceRef.current.getZoom());
      console.log('地图中心点:', mapInstanceRef.current.getCenter());

      // 清除之前的标记并标注选中的地点
      clearMarkers();

      // 添加标记和信息窗口
      const marker = new window.BMapGL.Marker(point);
      const infoWindow = new window.BMapGL.InfoWindow(
        `<div><strong>${place.title}</strong><br/>${place.address}</div>`,
        {
          width: 200,
          height: 80,
          title: '选中位置',
        },
      );

      marker.addEventListener('click', () => {
        mapInstanceRef.current!.openInfoWindow(infoWindow, point);
      });

      mapInstanceRef.current.addOverlay(marker);
      markersRef.current.push(marker);

      console.log('已添加标记，当前标记数量:', markersRef.current.length);

      // 立即打开信息窗口，确保用户能看到标记
      setTimeout(() => {
        mapInstanceRef.current!.openInfoWindow(infoWindow, point);
        console.log('信息窗口已打开');
      }, 500); // 增加延迟时间，确保地图移动完成后再打开信息窗口
    }
  };

  return (
    <div className={styles.searchBoxContainer}>
      <AutoComplete
        value={searchText}
        placeholder="请输入地点名称"
        allowClear
        options={autoCompleteOptions}
        filterOption={false} // 我们自己处理过滤
        style={{ width: '100%' }}
        onSearch={fetchAutoCompleteOptions}
        onSelect={handleAutoCompleteSelect}
        onChange={(value) => {
          setSearchText(value);
          // 当输入框内容变化时，重置下拉框状态
          if (value.trim() === '') {
            setKeepDropdownOpen(false);
          } else {
            // 当输入框有内容时，保持下拉框打开
            setKeepDropdownOpen(true);
          }
        }}
        // 添加自定义属性控制下拉框显示
        open={keepDropdownOpen}
      />

      {isLoading && <div className={styles.loadingContainer}>搜索中...</div>}
    </div>
  );
};
