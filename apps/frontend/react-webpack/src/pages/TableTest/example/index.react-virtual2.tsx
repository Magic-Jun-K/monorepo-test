// import { useRef, useMemo, useState, useCallback } from 'react';
// import { useVirtualizer } from '@tanstack/react-virtual';

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

// // 按列存储数据，每列是一个数组（类似原 glide-data-grid 的实现）
// // data[0] = 序号列, data[1] = 姓名列, data[2] = 年龄列, data[3] = 地址列, data[4] = 电话列
// // 由于浏览器最大滚动高度限制（约 33,554,400px），我们采用分块策略
// // 每块 50万行，共 2 块，总共 100万行
// const ROWS_PER_CHUNK = 500000;
// const TOTAL_CHUNKS = 2;
// const TOTAL_ROWS = ROWS_PER_CHUNK * TOTAL_CHUNKS; // 1,000,000

// const generateChunkData = (chunkIndex: number): string[][] => {
//   const startRow = chunkIndex * ROWS_PER_CHUNK;
//   const endRow = Math.min(startRow + ROWS_PER_CHUNK, TOTAL_ROWS);
//   const rowCount = endRow - startRow;

//   const indexCol: string[] = [];
//   const nameCol: string[] = [];
//   const ageCol: string[] = [];
//   const addressCol: string[] = [];
//   const phoneCol: string[] = [];

//   for (let i = 0; i < rowCount; i++) {
//     const actualIndex = startRow + i;
//     const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
//     const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
//     const city = cities[Math.floor(Math.random() * cities.length)];
//     const district = districts[Math.floor(Math.random() * districts.length)];

//     indexCol.push(String(actualIndex + 1));
//     nameCol.push(firstName! + lastName!);
//     ageCol.push(String(Math.floor(Math.random() * 40 + 20)));
//     addressCol.push(`${city!}市${district!}`);
//     phoneCol.push(generatePhone());
//   }

//   return [indexCol, nameCol, ageCol, addressCol, phoneCol];
// };

// // 延迟初始化数据缓存
// const dataCache: (string[][] | null)[] = [null, null];
// const getChunkData = (chunkIndex: number): string[][] => {
//   if (!dataCache[chunkIndex]) {
//     dataCache[chunkIndex] = generateChunkData(chunkIndex);
//   }
//   return dataCache[chunkIndex]!;
// };

// interface Column {
//   id: string;
//   title: string;
//   width: number;
// }

// const defaultColumns: Column[] = [
//   { id: 'index', title: '序号', width: 120 },
//   { id: 'name', title: '姓名', width: 150 },
//   { id: 'age', title: '年龄', width: 100 },
//   { id: 'address', title: '地址', width: 300 },
//   { id: 'phone', title: '电话', width: 200 },
// ];

// export default function TableTest() {
//   const [currentChunk, setCurrentChunk] = useState(0);
//   const data = useMemo(() => getChunkData(currentChunk), [currentChunk]);
//   const [columns, setColumns] = useState<Column[]>(defaultColumns);
//   const [resizingCol, setResizingCol] = useState<number | null>(null);

//   const tableContainerRef = useRef<HTMLDivElement>(null);

//   // 当前块的起始行号
//   const startRowNumber = currentChunk * ROWS_PER_CHUNK;

//   // 虚拟滚动配置 - 只虚拟化行
//   const rowCount = data[0]?.length || 0;
//   const virtualizer = useVirtualizer({
//     count: rowCount,
//     getScrollElement: () => tableContainerRef.current,
//     estimateSize: () => 42,
//     overscan: 5,
//     // 使用可变大小模式以支持大量数据
//     measureElement: (el) => el.getBoundingClientRect().height,
//   });

//   const virtualRows = virtualizer.getVirtualItems();

//   // 切换数据块
//   const handleChunkChange = (newChunk: number) => {
//     setCurrentChunk(newChunk);
//     // 切换块时滚动到顶部
//     if (tableContainerRef.current) {
//       tableContainerRef.current.scrollTop = 0;
//     }
//   };

//   // 处理列宽调整
//   const handleResizeStart = useCallback((colIndex: number) => {
//     setResizingCol(colIndex);
//   }, []);

//   const handleResizeMove = useCallback(
//     (e: React.MouseEvent, colIndex: number) => {
//       if (resizingCol !== colIndex) return;

//       const th = (e.target as HTMLElement).closest('th');
//       if (!th) return;

//       const rect = th.getBoundingClientRect();
//       const newWidth = e.clientX - rect.left;

//       if (newWidth > 50) {
//         setColumns((prev) => {
//           const newCols = [...prev];
//           newCols[colIndex] = { ...newCols[colIndex]!, width: newWidth };
//           return newCols;
//         });
//       }
//     },
//     [resizingCol],
//   );

//   const handleResizeEnd = useCallback(() => {
//     setResizingCol(null);
//   }, []);

//   return (
//     <div className="h-full p-4 bg-[#E6E6E6]" style={{ height: '92.5vh' }}>
//       {/* 显示统计信息和块切换 */}
//       <div className="mb-2 flex items-center justify-between px-2">
//         <div className="text-sm text-gray-600">
//           总行数: {TOTAL_ROWS.toLocaleString()} | 
//           当前块: {currentChunk + 1} / {TOTAL_CHUNKS} (行 {startRowNumber + 1} - {startRowNumber + rowCount}) | 
//           显示: {virtualRows.length > 0 ? `${startRowNumber + virtualRows[0]!.index + 1} - ${startRowNumber + virtualRows[virtualRows.length - 1]!.index + 1}` : '无'}
//         </div>
//         <div className="flex gap-2">
//           <button
//             onClick={() => handleChunkChange(0)}
//             disabled={currentChunk === 0}
//             className={`px-3 py-1 text-sm rounded ${
//               currentChunk === 0 
//                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
//                 : 'bg-[#7D5DFF] text-white hover:bg-[#6b4fe6]'
//             }`}
//           >
//             第 1 块 (1 - 500,000)
//           </button>
//           <button
//             onClick={() => handleChunkChange(1)}
//             disabled={currentChunk === 1}
//             className={`px-3 py-1 text-sm rounded ${
//               currentChunk === 1 
//                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
//                 : 'bg-[#7D5DFF] text-white hover:bg-[#6b4fe6]'
//             }`}
//           >
//             第 2 块 (500,001 - 1,000,000)
//           </button>
//         </div>
//       </div>
//       <div
//         ref={tableContainerRef}
//         className="h-full overflow-auto rounded-lg border border-gray-300 bg-white"
//         onMouseUp={handleResizeEnd}
//         onMouseLeave={handleResizeEnd}
//         style={{ maxHeight: '86vh' }}
//       >
//         <div className="relative">
//           {/* 表头 */}
//           <div
//             className="sticky top-0 z-10 flex bg-[#7D5DFF] text-white"
//             style={{ fontFamily: 'SmileySans-Oblique' }}
//           >
//             {columns.map((col, index) => (
//               <div
//                 key={col.id}
//                 className="relative border-r border-white/20 px-4 py-2 text-left text-sm font-semibold flex items-center"
//                 style={{ width: col.width, height: 42 }}
//                 onMouseMove={(e) => handleResizeMove(e, index)}
//               >
//                 {col.title}
//                 {/* 列宽调整手柄 */}
//                 <div
//                   onMouseDown={() => handleResizeStart(index)}
//                   className={`absolute right-0 top-0 h-full w-2 cursor-col-resize select-none ${
//                     resizingCol === index ? 'bg-white' : 'bg-transparent hover:bg-white/50'
//                   }`}
//                 />
//               </div>
//             ))}
//           </div>

//           {/* 表格内容 - 虚拟滚动 */}
//           <div
//             style={{
//               height: `${virtualizer.getTotalSize()}px`,
//               position: 'relative',
//               // 使用 contain 优化渲染性能
//               contain: 'layout',
//             }}
//           >
//             {virtualRows.map((virtualRow) => {
//               const rowIndex = virtualRow.index;
//               return (
//                 <div
//                   key={rowIndex}
//                   data-index={virtualRow.index}
//                   ref={virtualizer.measureElement}
//                   className="absolute left-0 flex border-b border-gray-200 hover:bg-gray-50 bg-white"
//                   style={{
//                     height: `${virtualRow.size}px`,
//                     transform: `translateY(${virtualRow.start}px)`,
//                     fontFamily: 'SmileySans-Oblique',
//                   }}
//                 >
//                   {columns.map((col, colIndex) => (
//                     <div
//                       key={`${rowIndex}-${col.id}`}
//                       className="border-r border-gray-200 px-4 py-2 text-sm flex items-center overflow-hidden text-ellipsis whitespace-nowrap"
//                       style={{ width: col.width }}
//                     >
//                       {colIndex === 0 
//                         ? String(startRowNumber + rowIndex + 1)  // 序号列显示全局行号
//                         : (data[colIndex]?.[rowIndex] ?? '')
//                       }
//                     </div>
//                   ))}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
