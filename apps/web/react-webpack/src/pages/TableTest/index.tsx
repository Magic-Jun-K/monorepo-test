import { useState, useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  ColumnHoverModule,
  RowSelectionModule,
  PaginationModule,
  TooltipModule,
  RowStyleModule,
  NumberEditorModule,
  TextEditorModule,
  RowApiModule,
} from 'ag-grid-community';
import type {
  ColDef,
  GridReadyEvent,
  ColumnResizedEvent,
  ColumnMovedEvent,
  ColGroupDef,
} from 'ag-grid-community';

import { generateExcelBuffer } from './excelExport';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import styles from './index.module.scss';

// 注册 AG Grid 模块（按需注册，避免引入 AllCommunityModule 的全部功能）
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  ColumnHoverModule,
  RowSelectionModule,
  PaginationModule,
  TooltipModule,
  RowStyleModule,
  NumberEditorModule,
  TextEditorModule,
  RowApiModule,
]);

const firstNames = ['张', '李', '王', '刘', '陈', '杨', '黄', '赵', '吴', '周'];
const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋'];
const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆'];
const districts = ['东区', '西区', '南区', '北区', '中区', '新区', '高新区', '开发区'];

const generatePhone = (): string => {
  const prefix = ['133', '138', '135', '136', '137', '139', '150', '151', '152', '158'];
  return (
    prefix[Math.floor(Math.random() * prefix.length)] +
    Array(8)
      .fill(0)
      .map(() => Math.floor(Math.random() * 10))
      .join('')
  );
};

interface TableRow {
  index: number;
  name: string;
  age: string;
  address: string;
  phone: string;
}

const generateTableData = (): TableRow[] => {
  const result: TableRow[] = [];
  for (let i = 0; i < 1000000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const district = districts[Math.floor(Math.random() * districts.length)];

    result.push({
      index: i + 1,
      name: firstName! + lastName!,
      age: String(Math.floor(Math.random() * 40 + 20)),
      address: `${city!}市${district!}`,
      phone: generatePhone(),
    });
  }
  return result;
};

const data = generateTableData();

export default function TableTest() {
  const gridRef = useRef<AgGridReact<TableRow>>(null);
  const [exportProgress, setExportProgress] = useState<{
    processed: number;
    total: number;
    percent: number;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // 定义表格列配置（带列分组）
  const [columnDefs] = useState<(ColDef<TableRow> | ColGroupDef<TableRow>)[]>([
    {
      headerName: '基本信息',
      children: [
        {
          field: 'index',
          headerName: '序号',
          width: 120,
          pinned: 'left',
          sortable: true,
          filter: 'agNumberColumnFilter',
        },
        {
          field: 'name',
          headerName: '姓名',
          width: 150,
          sortable: true,
          filter: 'agTextColumnFilter',
        },
        {
          field: 'age',
          headerName: '年龄',
          width: 100,
          sortable: true,
          filter: 'agNumberColumnFilter',
        },
      ],
    },
    {
      headerName: '联系信息',
      children: [
        {
          field: 'address',
          headerName: '地址',
          width: 300,
          sortable: true,
          filter: 'agTextColumnFilter',
        },
        {
          field: 'phone',
          headerName: '电话',
          width: 200,
          sortable: true,
          filter: 'agTextColumnFilter',
        },
      ],
    },
  ]);

  // 默认列配置
  const defaultColDef = useMemo<ColDef<TableRow>>(
    () => ({
      resizable: true,
      editable: true,
      flex: 0,
      // 启用悬浮高亮
      headerClass: 'header-highlight',
      // 启用 tooltip
      tooltipField: 'name' as keyof TableRow,
      // 默认过滤器参数
      filterParams: {
        buttons: ['reset', 'apply'],
        closeOnApply: true,
      },
      // 禁用不需要的功能以减少体积
      suppressHeaderMenuButton: false,
    }),
    [],
  );

  // 侧边栏配置（列工具面板）
  // const sideBar = useMemo(
  //   () => ({
  //     toolPanels: [
  //       {
  //         id: 'columns',
  //         labelDefault: 'Columns',
  //         labelKey: 'columns',
  //         iconKey: 'columns',
  //         toolPanel: 'agColumnsToolPanel',
  //         toolPanelParams: {
  //           suppressRowGroups: true,
  //           suppressValues: true,
  //           suppressPivots: true,
  //           suppressPivotMode: true,
  //         },
  //       },
  //       {
  //         id: 'filters',
  //         labelDefault: 'Filters',
  //         labelKey: 'filters',
  //         iconKey: 'filter',
  //         toolPanel: 'agFiltersToolPanel',
  //       },
  //     ],
  //     defaultToolPanel: 'columns',
  //   }),
  //   [],
  // );

  // 处理列宽调整
  const onColumnResized = useCallback((event: ColumnResizedEvent<TableRow>) => {
    if (event.finished && event.column) {
      console.log('列宽调整:', event.column.getColId(), event.column.getActualWidth());
    }
  }, []);

  // 处理列移动
  const onColumnMoved = useCallback((event: ColumnMovedEvent<TableRow>) => {
    if (event.finished && gridRef.current) {
      const columnState = gridRef.current.api.getColumnState();
      console.log(
        '列顺序更新:',
        columnState.map((col) => col.colId),
      );
    }
  }, []);

  // 表格就绪事件
  const onGridReady = useCallback((params: GridReadyEvent<TableRow>) => {
    console.log('Grid ready, row count:', params.api.getDisplayedRowCount());
  }, []);

  return (
    <div
      className="h-full p-4 bg-linear-to-br from-gray-50 to-gray-100"
      style={{ height: '92.5vh' }}
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
        {/* 标题栏 */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-between">
          <h2 className="text-white text-lg font-semibold tracking-wide">数据表格</h2>
          <span className="text-white/80 text-sm">共 {data.length.toLocaleString()} 条记录</span>
        </div>

        {/* 工具栏 */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            onClick={() => gridRef.current?.api.selectAll()}
          >
            全选
          </button>
          <button
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
            onClick={() => gridRef.current?.api.deselectAll()}
          >
            取消选择
          </button>
          <button
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isExporting}
            onClick={async () => {
              try {
                setIsExporting(true);
                setExportProgress(null);
                console.log('开始导出...');

                // 获取所有数据
                const rowData: TableRow[] = [];
                gridRef.current?.api.forEachNodeAfterFilterAndSort((node) => {
                  if (node.data) {
                    rowData.push(node.data);
                  }
                });

                console.log('获取到数据条数:', rowData.length);

                if (rowData.length === 0) {
                  alert('没有可导出的数据');
                  return;
                }

                // 准备数据
                const headers = ['序号', '姓名', '年龄', '地址', '电话'];

                console.log('开始生成 Excel...');
                // 使用 Web Worker 生成 Excel
                const excelBuffer = await generateExcelBuffer(rowData, headers, (progress) => {
                  setExportProgress({
                    processed: progress.processed,
                    total: progress.total,
                    percent: progress.percent,
                  });
                  console.log(
                    `导出进度: ${progress.percent}% (${progress.processed}/${progress.total})`,
                  );
                });

                console.log('Excel 生成完成，大小:', excelBuffer.byteLength);

                const blob = new Blob([excelBuffer as unknown as ArrayBuffer], {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });

                // 下载文件
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `数据导出_${new Date().toLocaleDateString()}_${rowData.length}条.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);

                console.log('导出完成');
                alert(`成功导出 ${rowData.length.toLocaleString()} 条数据！`);
              } catch (error) {
                console.error('导出失败:', error);
                alert('导出失败: ' + (error instanceof Error ? error.message : String(error)));
              } finally {
                setIsExporting(false);
                setExportProgress(null);
              }
            }}
          >
            {isExporting ? '导出中...' : '导出Excel'}
          </button>

          {/* 导出进度显示 */}
          {isExporting && exportProgress && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${exportProgress.percent}%` }}
                />
              </div>
              <span>{exportProgress.percent}%</span>
              <span className="text-xs text-gray-400">
                ({exportProgress.processed.toLocaleString()}/{exportProgress.total.toLocaleString()}
                )
              </span>
            </div>
          )}
          <div className="flex-1"></div>
          <input
            type="text"
            placeholder="搜索..."
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            onChange={(e) => gridRef.current?.api.setGridOption('quickFilterText', e.target.value)}
          />
        </div>

        {/* 表格区域 */}
        <div className={`flex-1 overflow-hidden ${styles['ag-theme-custom']}`}>
          <AgGridReact<TableRow>
            ref={gridRef}
            rowData={data}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            headerHeight={56}
            rowHeight={52}
            rowSelection={{
              mode: 'multiRow',
              enableClickSelection: true,
              checkboxes: true,
              headerCheckbox: true,
            }}
            pagination={true}
            paginationPageSize={100}
            paginationPageSizeSelector={[100, 1000, 10000, 10000000]}
            animateRows={true}
            onGridReady={onGridReady}
            onColumnResized={onColumnResized}
            onColumnMoved={onColumnMoved}
            theme="legacy"
            // 样式配置
            rowClass="hover:bg-blue-50 transition-colors duration-150"
            rowStyle={{ cursor: 'default' }}
            // 行选择配置
            // 其他配置
            enableCellTextSelection={true}
            suppressScrollOnNewData={true}
          />
        </div>
      </div>
    </div>
  );
}
