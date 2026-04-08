// import { useState, useCallback, useMemo, useRef } from 'react';
// import { AgGridReact } from 'ag-grid-react';
// import {
//   ModuleRegistry,
//   AllCommunityModule,
//   ClientSideRowModelModule,
//   TextFilterModule,
//   NumberFilterModule,
//   DateFilterModule,
//   ColumnHoverModule,
//   RowSelectionModule,
//   PaginationModule,
//   TooltipModule,
// } from 'ag-grid-community';
// import type {
//   ColDef,
//   GridReadyEvent,
//   ColumnResizedEvent,
//   ColumnMovedEvent,
//   ColGroupDef,
// } from 'ag-grid-community';

// import 'ag-grid-community/styles/ag-grid.css';
// import 'ag-grid-community/styles/ag-theme-alpine.css';

// // 注册 AG Grid 模块
// ModuleRegistry.registerModules([
//   AllCommunityModule,
//   ClientSideRowModelModule,
//   TextFilterModule,
//   NumberFilterModule,
//   DateFilterModule,
//   ColumnHoverModule,
//   RowSelectionModule,
//   PaginationModule,
//   TooltipModule,
// ]);

// const firstNames = ['张', '李', '王', '刘', '陈', '杨', '黄', '赵', '吴', '周'];
// const lastNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '洋'];
// const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆'];
// const districts = ['东区', '西区', '南区', '北区', '中区', '新区', '高新区', '开发区'];

// const generatePhone = (): string => {
//   const prefix = ['133', '138', '135', '136', '137', '139', '150', '151', '152', '158'];
//   return (
//     prefix[Math.floor(Math.random() * prefix.length)] +
//     Array(8)
//       .fill(0)
//       .map(() => Math.floor(Math.random() * 10))
//       .join('')
//   );
// };

// interface TableRow {
//   index: number;
//   name: string;
//   age: string;
//   address: string;
//   phone: string;
// }

// const generateTableData = (): TableRow[] => {
//   const result: TableRow[] = [];
//   for (let i = 0; i < 1000000; i++) {
//     const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
//     const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
//     const city = cities[Math.floor(Math.random() * cities.length)];
//     const district = districts[Math.floor(Math.random() * districts.length)];

//     result.push({
//       index: i + 1,
//       name: firstName! + lastName!,
//       age: String(Math.floor(Math.random() * 40 + 20)),
//       address: `${city!}市${district!}`,
//       phone: generatePhone(),
//     });
//   }
//   return result;
// };

// const data = generateTableData();

// export default function TableTest() {
//   const gridRef = useRef<AgGridReact<TableRow>>(null);

//   // 定义表格列配置（带列分组）
//   const [columnDefs] = useState<(ColDef<TableRow> | ColGroupDef<TableRow>)[]>([
//     {
//       headerName: '基本信息',
//       children: [
//         {
//           field: 'index',
//           headerName: '序号',
//           width: 120,
//           pinned: 'left',
//           sortable: true,
//           filter: 'agNumberColumnFilter',
//         },
//         {
//           field: 'name',
//           headerName: '姓名',
//           width: 150,
//           sortable: true,
//           filter: 'agTextColumnFilter',
//         },
//         {
//           field: 'age',
//           headerName: '年龄',
//           width: 100,
//           sortable: true,
//           filter: 'agNumberColumnFilter',
//         },
//       ],
//     },
//     {
//       headerName: '联系信息',
//       children: [
//         {
//           field: 'address',
//           headerName: '地址',
//           width: 300,
//           sortable: true,
//           filter: 'agTextColumnFilter',
//         },
//         {
//           field: 'phone',
//           headerName: '电话',
//           width: 200,
//           sortable: true,
//           filter: 'agTextColumnFilter',
//         },
//       ],
//     },
//   ]);

//   // 默认列配置
//   const defaultColDef = useMemo<ColDef<TableRow>>(
//     () => ({
//       resizable: true,
//       editable: true,
//       flex: 0,
//       // 启用悬浮高亮
//       headerClass: 'header-highlight',
//       // 启用 tooltip
//       tooltipField: 'name' as keyof TableRow,
//       // 默认过滤器参数
//       filterParams: {
//         buttons: ['reset', 'apply'],
//         closeOnApply: true,
//       },
//     }),
//     [],
//   );

//   // 侧边栏配置（列工具面板）
//   const sideBar = useMemo(
//     () => ({
//       toolPanels: [
//         {
//           id: 'columns',
//           labelDefault: 'Columns',
//           labelKey: 'columns',
//           iconKey: 'columns',
//           toolPanel: 'agColumnsToolPanel',
//           toolPanelParams: {
//             suppressRowGroups: true,
//             suppressValues: true,
//             suppressPivots: true,
//             suppressPivotMode: true,
//           },
//         },
//         {
//           id: 'filters',
//           labelDefault: 'Filters',
//           labelKey: 'filters',
//           iconKey: 'filter',
//           toolPanel: 'agFiltersToolPanel',
//         },
//       ],
//       defaultToolPanel: 'columns',
//     }),
//     [],
//   );

//   // 处理列宽调整
//   const onColumnResized = useCallback((event: ColumnResizedEvent<TableRow>) => {
//     if (event.finished && event.column) {
//       console.log('列宽调整:', event.column.getColId(), event.column.getActualWidth());
//     }
//   }, []);

//   // 处理列移动
//   const onColumnMoved = useCallback((event: ColumnMovedEvent<TableRow>) => {
//     if (event.finished && gridRef.current) {
//       const columnState = gridRef.current.api.getColumnState();
//       console.log(
//         '列顺序更新:',
//         columnState.map((col) => col.colId),
//       );
//     }
//   }, []);

//   // 表格就绪事件
//   const onGridReady = useCallback((params: GridReadyEvent<TableRow>) => {
//     console.log('Grid ready, row count:', params.api.getDisplayedRowCount());
//   }, []);

//   return (
//     <div
//       className="h-full p-4 bg-linear-to-br from-gray-50 to-gray-100"
//       style={{ height: '92.5vh' }}
//     >
//       <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
//         {/* 标题栏 */}
//         <div className="px-6 py-4 bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-between">
//           <h2 className="text-white text-lg font-semibold tracking-wide">数据表格</h2>
//           <span className="text-white/80 text-sm">共 {data.length.toLocaleString()} 条记录</span>
//         </div>

//         {/* 工具栏 */}
//         <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
//           <button
//             className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
//             onClick={() => gridRef.current?.api.selectAll()}
//           >
//             全选
//           </button>
//           <button
//             className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
//             onClick={() => gridRef.current?.api.deselectAll()}
//           >
//             取消选择
//           </button>
//           <button
//             className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
//             onClick={async () => {
//               // 获取当前显示的数据（考虑过滤和排序）
//               const rowData: TableRow[] = [];
//               gridRef.current?.api.forEachNodeAfterFilterAndSort((node) => {
//                 if (node.data) {
//                   rowData.push(node.data);
//                 }
//               });

//               // 准备数据
//               const headers = ['序号', '姓名', '年龄', '地址', '电话'];
//               const rows = rowData.map((row) => [row.index, row.name, row.age, row.address, row.phone]);

//               // 使用原生方式生成 Excel XML 格式
//               const escapeXml = (str: string | number): string => {
//                 return String(str)
//                   .replace(/&/g, '&amp;')
//                   .replace(/</g, '&lt;')
//                   .replace(/>/g, '&gt;')
//                   .replace(/"/g, '&quot;')
//                   .replace(/'/g, '&apos;');
//               };

//               // 构建 Excel XML 内容
//               let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
//               xml += '<?mso-application progid="Excel.Sheet"?>\n';
//               xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
//               xml += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
//               xml += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
//               xml += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
//               xml += '<Styles>\n';
//               xml += '<Style ss:ID="Default"><Alignment ss:Vertical="Center"/><Font ss:Size="11"/></Style>\n';
//               xml += '<Style ss:ID="Header"><Font ss:Bold="1" ss:Size="12"/><Interior ss:Color="#E0E7FF" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/></Style>\n';
//               xml += '</Styles>\n';
//               xml += '<Worksheet ss:Name="数据"><Table>\n';

//               // 添加列宽
//               xml += '<Column ss:Width="60"/><Column ss:Width="100"/><Column ss:Width="60"/><Column ss:Width="200"/><Column ss:Width="120"/>\n';

//               // 添加表头
//               xml += '<Row ss:Height="20">\n';
//               headers.forEach((header) => {
//                 xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(header)}</Data></Cell>\n`;
//               });
//               xml += '</Row>\n';

//               // 添加数据行
//               rows.forEach((row) => {
//                 xml += '<Row ss:Height="18">\n';
//                 row.forEach((cell, index) => {
//                   const type = index === 0 || index === 2 ? 'Number' : 'String';
//                   xml += `<Cell><Data ss:Type="${type}">${escapeXml(cell)}</Data></Cell>\n`;
//                 });
//                 xml += '</Row>\n';
//               });

//               xml += '</Table></Worksheet>\n';
//               xml += '</Workbook>';

//               // 创建 Blob 并下载
//               const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
//               const link = document.createElement('a');
//               link.href = URL.createObjectURL(blob);
//               link.download = `数据导出_${new Date().toLocaleDateString()}.xls`;
//               document.body.appendChild(link);
//               link.click();
//               document.body.removeChild(link);
//               URL.revokeObjectURL(link.href);
//             }}
//           >
//             导出Excel
//           </button>
//           <div className="flex-1"></div>
//           <input
//             type="text"
//             placeholder="搜索..."
//             className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
//             onChange={(e) => gridRef.current?.api.setGridOption('quickFilterText', e.target.value)}
//           />
//         </div>

//         {/* 表格区域 */}
//         <div className="flex-1 overflow-hidden ag-theme-custom">
//           <AgGridReact<TableRow>
//             ref={gridRef}
//             rowData={data}
//             columnDefs={columnDefs}
//             defaultColDef={defaultColDef}
//             headerHeight={56}
//             rowHeight={52}
//             rowSelection={{
//               mode: 'multiRow',
//               enableClickSelection: true,
//               checkboxes: true,
//               headerCheckbox: true,
//             }}
//             pagination={true}
//             paginationPageSize={100}
//             paginationPageSizeSelector={[100, 1000, 10000, 10000000]}
//             animateRows={true}
//             onGridReady={onGridReady}
//             onColumnResized={onColumnResized}
//             onColumnMoved={onColumnMoved}
//             theme="legacy"
//             // 样式配置
//             rowClass="hover:bg-blue-50 transition-colors duration-150"
//             rowStyle={{ cursor: 'default' }}
//             // 行选择配置
//             // 其他配置
//             enableCellTextSelection={true}
//             suppressScrollOnNewData={true}
//           />
//         </div>
//       </div>

//       {/* 自定义样式 */}
//       <style>{`
//         /* 使用 ag-theme-alpine 作为基础，添加自定义样式 */
//         .ag-theme-custom {
//           --ag-grid-size: 8px;
//           --ag-background-color: #ffffff;
//           --ag-header-background-color: #f8fafc;
//           --ag-header-foreground-color: #1e293b;
//           --ag-foreground-color: #334155;
//           --ag-row-hover-color: #eff6ff;
//           --ag-selected-row-background-color: #dbeafe;
//           --ag-border-color: #e2e8f0;
//           --ag-cell-horizontal-padding: 16px;
//           --ag-header-cell-hover-background-color: #f1f5f9;
//           --ag-font-family: 'SmileySans-Oblique', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
//           --ag-font-size: 16px;
//           --ag-header-font-weight: 600;
//           --ag-borders: solid 1px;
//           --ag-border-radius: 8px;
//           /* 确保图标字体正确加载 */
//           --ag-icon-font-family: 'agGridAlpine';
//         }

//         /* 勾选框样式 - 直接修改AG Grid内部元素 */
//         .ag-theme-custom .ag-selection-checkbox,
//         .ag-theme-custom .ag-header-select-all {
//           cursor: pointer !important;
//         }

//         /* 修改AG Grid勾选框尺寸 */
//         .ag-theme-custom .ag-checkbox-input {
//           width: 20px !important;
//           height: 20px !important;
//           cursor: pointer !important;
//         }

//         /* 修改勾选框选中状态颜色 */
//         .ag-theme-custom .ag-checkbox-input-wrapper.ag-checked {
//           --ag-checkbox-checked-color: #3b82f6;
//         }

//         /* 使用CSS变量控制勾选框颜色 */
//         .ag-theme-custom {
//           --ag-checkbox-checked-color: #3b82f6;
//           --ag-checkbox-unchecked-color: #e2e8f0;
//           --ag-checkbox-background-color: #ffffff;
//           --ag-checkbox-border-radius: 4px;
//           --ag-checkbox-border-width: 2px;
//           --ag-icon-size: 20px;
//         }

//         /* 行悬停效果 */
//         .ag-theme-custom .ag-row-hover {
//           background-color: #eff6ff !important;
//         }

//         /* 选中行样式 */
//         .ag-theme-custom .ag-row-selected {
//           background-color: #dbeafe !important;
//         }

//         /* 表头样式 */
//         .ag-theme-custom .ag-header-cell {
//           font-weight: 600;
//           color: #1e293b;
//           border-right: 1px solid #e2e8f0;
//         }

//         .ag-theme-custom .ag-header-cell:hover {
//           background-color: #f1f5f9;
//         }

//         /* 单元格样式 - 垂直居中 */
//         .ag-theme-custom .ag-cell {
//           border-right: 1px solid #f1f5f9;
//           display: flex !important;
//           align-items: center !important;
//           line-height: normal !important;
//         }

//         /* 确保单元格内容垂直居中 */
//         .ag-theme-custom .ag-cell-wrapper {
//           display: flex;
//           align-items: center;
//           height: 100%;
//         }

//         .ag-theme-custom .ag-cell-value {
//           display: flex;
//           align-items: center;
//         }

//         /* 分页栏样式 */
//         .ag-theme-custom .ag-paging-panel {
//           background-color: #f8fafc;
//           border-top: 1px solid #e2e8f0;
//           padding: 12px 16px;
//           font-size: 13px;
//         }

//         /* 滚动条样式 */
//         .ag-theme-custom ::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }

//         .ag-theme-custom ::-webkit-scrollbar-track {
//           background: #f1f5f9;
//         }

//         .ag-theme-custom ::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 4px;
//         }

//         .ag-theme-custom ::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }

//         /* 列分组样式 */
//         .ag-theme-custom .ag-header-group-cell {
//           background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
//           font-weight: 700;
//           color: #0f172a;
//         }
//       `}</style>
//     </div>
//   );
// }
