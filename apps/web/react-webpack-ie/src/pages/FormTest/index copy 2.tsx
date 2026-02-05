import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Button } from '@eggshell/ui-unocss-ie';
import { DataEditor, GridCell, GridCellKind } from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';

import ImageTestModal from './components/ImageTestModal';
import FormTestModal from './components/FormTestModal';
import EChartsTestModal from './components/EChartsTestModal';

import styles from './index.module.scss';

interface Column {
  title: string;
  width: number;
  id: string;
}

export default () => {
  const [isOpenImage, setIsOpenImage] = useState(false); // 是否打开ECharts模态框
  const [isOpenECharts, setIsOpenECharts] = useState(false); // 是否打开ECharts模态框
  const [isOpenForm, setIsOpenForm] = useState(false); // 是否打开表单模态框

  // 初始列设置（宽度值为参考值）
  const initialColumns: Column[] = [
    { title: '序号', width: 120, id: 'index' },
    { title: '姓名', width: 150, id: 'name' },
    { title: '年龄', width: 100, id: 'age' },
    { title: '地址', width: 300, id: 'address' },
    { title: '电话', width: 200, id: 'phone' }
  ];

  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 当容器宽度变化时，重新计算各列宽度
    const recalcColumns = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        console.log('containerWidth', containerWidth);
        // 计算初始总宽度
        const totalFixedWidth = initialColumns.reduce((sum, col) => sum + col.width, 0);
        // 计算缩放比例
        const scaleFactor = containerWidth / totalFixedWidth;
        // 更新每个列的宽度
        const newColumns = initialColumns.map(col => ({
          ...col,
          width: Math.floor(col.width * scaleFactor)
        }));
        console.log('newColumns', newColumns);
        setColumns(newColumns);
      }
    };
    recalcColumns();
    window.addEventListener('resize', recalcColumns);
    return () => window.removeEventListener('resize', recalcColumns);
  }, []);

  // 生成随机数据（数据每行仅包含：姓名、年龄、地址、电话）
  const data = useMemo(() => {
    const firstNames = ['张', '李', '王', '刘', '陈', '杨', '黄', '赵', '吴', '周'];
    const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋'];
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆'];
    const districts = ['东区', '西区', '南区', '北区', '中区', '新区', '高新区', '开发区'];

    const generatePhone = () => {
      const prefix = ['133', '138', '135', '136', '137', '139', '150', '151', '152', '158'];
      return (
        prefix[Math.floor(Math.random() * prefix.length)] +
        Array(8)
          .fill(0)
          .map(() => Math.floor(Math.random() * 10))
          .join('')
      );
    };

    const result: string[][] = [];
    for (let i = 0; i < 100000; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const district = districts[Math.floor(Math.random() * districts.length)];

      const row = [firstName! + lastName!, String(Math.floor(Math.random() * 40 + 20)), `${city!}市${district!}`, generatePhone()];
      result.push(row);
    }
    return result;
  }, []);

  // 根据单元格位置返回对应的 GridCell
  const getCellContent = useCallback(
    (cell: readonly [number, number]): GridCell => {
      const [row, col] = cell;
      // 这里我们直接假设数据数组每行数据从左到右与 columns 顺序一致
      const dataValue = data[row]?.[col] ?? '';
      return {
        kind: GridCellKind.Text,
        allowOverlay: true,
        readonly: false,
        displayData: dataValue,
        data: dataValue,
        // 使用官方默认 style（可选）
        style: 'normal'
      };
    },
    [data]
  );

  // 处理列宽调整
  const handleColumnResize = useCallback((_column: any, newSize: number, colIndex: number) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      newColumns[colIndex] = { ...prevColumns[colIndex], width: newSize };
      return newColumns;
    });
  }, []);

  const [sortableCols, setSortableCols] = useState(columns);

  const onColMoved = useCallback((startIndex: number, endIndex: number): void => {
    setSortableCols(old => {
      const newCols = [...old];
      const removed = newCols.splice(startIndex, 1);
      if (removed.length === 0) return old;
      newCols.splice(endIndex, 0, removed[0] as Column);
      return newCols;
    });
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <div style={{ paddingBottom: '20px' }}>
        <Button type="primary" onClick={() => setIsOpenImage(true)}>
          图片测试按钮
        </Button>
        <Button type="primary" onClick={() => setIsOpenECharts(true)}>
          ECharts测试按钮
        </Button>
        <Button type="primary" onClick={() => setIsOpenForm(true)}>
          表单测试按钮
        </Button>
      </div>
      <div style={{ height: '900px' }}>
        <DataEditor
          width="100%"
          rows={data.length}
          columns={sortableCols}
          getCellContent={getCellContent}
          headerHeight={42} // 表头高度
          rowHeight={42} // 行高
          freezeColumns={1} // 冻结第一列
          theme={{
            bgIconHeader: '#7D5DFF',
            accentColor: '#7D5DFF',
            accentLight: '#7D5DFF20',
            fgIconHeader: '#FFF',
            baseFontStyle: '24px',
            headerFontStyle: '600 24px',
            fontFamily: 'Arial, sans-serif'
          }}
          fillHandle={false} // 不显示填充手柄
          verticalBorder={true} // 显示垂直边框
          onColumnResize={handleColumnResize} // 列宽调整
          onColumnMoved={onColMoved} // 列移动
        />
      </div>
      <ImageTestModal visible={isOpenImage} onCancel={() => setIsOpenImage(false)} />
      <FormTestModal visible={isOpenForm} onCancel={() => setIsOpenForm(false)} />
      <EChartsTestModal visible={isOpenECharts} onCancel={() => setIsOpenECharts(false)} />
    </div>
  );
};
