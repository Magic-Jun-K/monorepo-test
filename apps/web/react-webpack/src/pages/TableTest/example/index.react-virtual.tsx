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
// const generateTableData = (): string[][] => {
//   const rowCount = 1000000;
//   const indexCol: string[] = [];
//   const nameCol: string[] = [];
//   const ageCol: string[] = [];
//   const addressCol: string[] = [];
//   const phoneCol: string[] = [];

//   for (let i = 0; i < rowCount; i++) {
//     const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
//     const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
//     const city = cities[Math.floor(Math.random() * cities.length)];
//     const district = districts[Math.floor(Math.random() * districts.length)];

//     indexCol.push(String(i + 1));
//     nameCol.push(firstName! + lastName!);
//     ageCol.push(String(Math.floor(Math.random() * 40 + 20)));
//     addressCol.push(`${city!}市${district!}`);
//     phoneCol.push(generatePhone());
//   }

//   return [indexCol, nameCol, ageCol, addressCol, phoneCol];
// };

// // 延迟初始化数据
// let dataCache: string[][] | null = null;
// const getData = (): string[][] => {
//   if (!dataCache) {
//     dataCache = generateTableData();
//   }
//   return dataCache;
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
//   const data = useMemo(() => getData(), []);
//   const [columns, setColumns] = useState<Column[]>(defaultColumns);
//   const [resizingCol, setResizingCol] = useState<number | null>(null);

//   const tableContainerRef = useRef<HTMLDivElement>(null);

//   // 虚拟滚动配置 - 只虚拟化行
//   const virtualizer = useVirtualizer({
//     count: data[0]?.length || 0,
//     getScrollElement: () => tableContainerRef.current,
//     estimateSize: () => 42,
//     overscan: 5,
//   });

//   const virtualRows = virtualizer.getVirtualItems();

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
//       <div
//         ref={tableContainerRef}
//         className="h-full overflow-auto rounded-lg border border-gray-300 bg-white"
//         onMouseUp={handleResizeEnd}
//         onMouseLeave={handleResizeEnd}
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
//             }}
//           >
//             {virtualRows.map((virtualRow) => {
//               const rowIndex = virtualRow.index;
//               return (
//                 <div
//                   key={rowIndex}
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
//                       {data[colIndex]?.[rowIndex] ?? ''}
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
