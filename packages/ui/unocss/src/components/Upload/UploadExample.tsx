// import { Upload } from './Upload';

// function Example() {
//   return (
//     <div className="w-full h-full">
//       {/* <Upload>
//         <Button type="primary">上传文件</Button>
//       </Upload> */}
//       <div className="p-4 w-120">
//         <h2 className="text-xl font-bold mb-4">文件上传测试</h2>
//         <div className="mb-6">
//           <h3 className="text-lg font-medium mb-2">图片卡片模式</h3>
//           <Upload
//             accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
//             multiple
//             listType="picture-card"
//             onChange={info => {
//               console.log('上传状态变化:', info.file.status, info.fileList);

//               // 根据不同的上传状态显示不同的消息
//               if (info.file.status === 'uploading') {
//                 console.log(`${info.file.name} 正在上传中...`);
//               } else if (info.file.status === 'done') {
//                 console.log(`${info.file.name} 上传成功！`);
//               } else if (info.file.status === 'error') {
//                 console.log(`${info.file.name} 上传失败！`);
//               }
//             }}
//           />
//           <p className="mt-2 text-gray-500">支持上传图片、PDF和Word文档，可以多选或拖拽上传</p>
//           <p className="text-blue-500 mt-1">
//             <span className="i-carbon-information mr-1"></span>
//             上传成功后，点击文件可以预览，右上角按钮可以删除
//           </p>
//         </div>

//         <div className="mb-6">
//           <h3 className="text-lg font-medium mb-2">文本列表模式</h3>
//           <Upload
//             accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
//             multiple
//             listType="text"
//             onChange={info => {
//               if (info.file.status === 'done') {
//                 console.log(`${info.file.name} 上传成功！`);
//               }
//             }}
//           />
//           <p className="mt-2 text-gray-500">点击文件名可以查看文件内容，右侧按钮可以删除文件</p>
//         </div>

//         <div>
//           <h3 className="text-lg font-medium mb-2">图片列表模式</h3>
//           <Upload
//             accept="image/*,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
//             multiple
//             listType="picture"
//             onChange={info => {
//               if (info.file.status === 'done') {
//                 console.log(`${info.file.name} 上传成功！`);
//               }
//             }}
//           />
//           <p className="mt-2 text-gray-500">适合图片上传，点击图片可以查看大图</p>
//         </div>
//       </div>
//     </div>
//   );
// }
// export default Example;
