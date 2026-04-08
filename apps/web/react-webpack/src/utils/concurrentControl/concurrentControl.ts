// /**
//  * 并发控制
//  */
// export class ConcurrentControl {
//   private maxConcurrency: number;
//   private currentConcurrency: number = 0;
//   private queue: Array<() => void> = [];

//   constructor(maxConcurrency: number) {
//     this.maxConcurrency = maxConcurrency;
//   }

//   addTask<T>(task: () => Promise<T>): Promise<T> {
//     return new Promise((resolve, reject) => {
//       const wrappedTask = async () => {
//         try {
//           this.currentConcurrency++;
//           const result = await task();
//           resolve(result);
//         } catch (error) {
//           reject(error);
//         } finally {
//           this.currentConcurrency--;
//           this.runNext();
//         }
//       };
//       this.queue.push(wrappedTask);
//       this.runNext();
//     });
//   }

//   private runNext() {
//     while (this.currentConcurrency < this.maxConcurrency && this.queue.length > 0) {
//       const task = this.queue.shift()!;
//       task();
//     }
//   }
// }

// // // 使用示例
// // const controller = new ConcurrentControl(2); // 最多同时执行 2 个任务

// // // 模拟异步任务
// // const createTask = (id: number, delay: number) => () =>
// //   new Promise<number>(resolve =>
// //     setTimeout(() => {
// //       console.log(`任务 ${id} 完成`);
// //       resolve(id);
// //     }, delay)
// //   );

// // // 添加任务
// // controller.addTask(createTask(1, 1000));
// // controller.addTask(createTask(2, 500));
// // controller.addTask(createTask(3, 800));
// // controller.addTask(createTask(4, 300));
