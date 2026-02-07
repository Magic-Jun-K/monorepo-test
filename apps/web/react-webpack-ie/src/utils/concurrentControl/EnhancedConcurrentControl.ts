// // ==================== 类型定义 ====================
// /**
//  * 任务优先级类型
//  */
// type TaskPriority = 'high' | 'normal' | 'low';

// /**
//  * 并发控制器配置选项
//  */
// interface ConcurrentControlOptions {
//   /** 初始并发数（默认根据硬件计算） */
//   initialConcurrency?: number;
//   /** 最小并发数（默认1） */
//   minConcurrency?: number;
//   /** 最大并发数（默认16） */
//   maxConcurrency?: number;
//   /** 是否启用自动调整（默认true） */
//   autoAdjust?: boolean;
//   /** 是否启用优先级队列（默认false） */
//   priority?: boolean;
// }

// // ==================== 链表队列实现 ====================
// /**
//  * 链表节点
//  */
// class QueueNode<T> {
//   constructor(
//     public value: T,
//     public next: QueueNode<T> | null = null
//   ) {}
// }

// /**
//  * 高性能链表队列
//  */
// class LinkedListQueue<T> {
//   private head: QueueNode<T> | null = null;
//   private tail: QueueNode<T> | null = null;
//   private _length = 0;

//   /** 入队操作 O(1) */
//   enqueue(value: T): void {
//     const node = new QueueNode(value);
//     if (!this.tail) {
//       this.head = node;
//     } else {
//       this.tail.next = node;
//     }
//     this.tail = node;
//     this._length++;
//   }

//   /** 出队操作 O(1) */
//   dequeue(): T | undefined {
//     if (!this.head) return undefined;
//     const value = this.head.value;
//     this.head = this.head.next;
//     if (!this.head) this.tail = null;
//     this._length--;
//     return value;
//   }

//   /** 获取队列长度 O(1) */
//   get length(): number {
//     return this._length;
//   }
// }

// // ==================== 核心并发控制器 ====================
// export class EnhancedConcurrentControl {
//   // ========== 实例属性 ==========
//   private currentConcurrency = 0;
//   private maxConcurrency: number;
//   private minConcurrency: number;
//   private readonly autoAdjust: boolean;
//   private readonly priorityEnabled: boolean;

//   // ========== 队列系统 ==========
//   private highPriorityQueue = new LinkedListQueue<() => void>();
//   private normalPriorityQueue = new LinkedListQueue<() => void>();
//   private lowPriorityQueue = new LinkedListQueue<() => void>();
//   private retryQueue = new LinkedListQueue<() => void>(); // 重试队列

//   // ========== 状态追踪 ==========
//   private successCount = 0;
//   private errorCount = 0;
//   private lastAdjustTime = 0;
//   private abortControllers = new Map<string, AbortController>();
//   private metricsListeners = new Set<(metrics: Metrics) => void>();

//   // ========== 总耗时统计 ==========
//   private totalDuration = 0;

//   // ========== 构造函数 ==========
//   constructor(options: ConcurrentControlOptions = {}) {
//     const {
//       initialConcurrency = this.calculateInitialConcurrency(),
//       minConcurrency = 1,
//       maxConcurrency = 16,
//       autoAdjust = true,
//       priority = false
//     } = options;

//     // 参数校验
//     if (minConcurrency < 1) throw new Error('最小并发数不能小于1');
//     if (maxConcurrency < minConcurrency) {
//       throw new Error('最大并发数不能小于最小并发数');
//     }

//     const hardwareMax = this.getHardwareConcurrency();
//     this.maxConcurrency = Math.min(Math.max(initialConcurrency, minConcurrency), Math.min(maxConcurrency, hardwareMax));
//     this.minConcurrency = Math.max(minConcurrency, 1);
//     this.autoAdjust = autoAdjust;
//     this.priorityEnabled = priority;

//     // 启动网络感知和重试队列处理
//     this.setupNetworkAwareness();
//     this.startRetryProcessor();

//     // 初始指标报告
//     this.reportMetrics();
//   }

//   // ========== 公开方法 ==========
//   /**
//    * 添加异步任务
//    * @param task 异步任务函数
//    * @param options 任务选项
//    * @returns Promise<T>
//    */
//   public addTask<T>(
//     task: (signal: AbortSignal) => Promise<T>,
//     options: {
//       priority?: TaskPriority;
//       timeout?: number;
//       abortKey?: string;
//     } = {}
//   ): Promise<T> {
//     return new Promise((resolve, reject) => {
//       const controller = new AbortController();
//       if (options.abortKey) {
//         this.abortControllers.set(options.abortKey, controller);
//       }

//       const wrappedTask = async () => {
//         const startTime = performance.now(); // 记录开始时间
//         try {
//           this.currentConcurrency++;
//           this.reportMetrics();

//           // 执行任务（带超时控制）
//           const result: T = await Promise.race([
//             task(controller.signal),
//             this.createTimeoutPromise<T>(options.timeout),
//             this.createAbortPromise<T>(controller.signal)
//           ]);

//           this.recordSuccess();
//           resolve(result);
//         } catch (error) {
//           if (this.isRetryableError(error)) {
//             this.retryQueue.enqueue(wrappedTask);
//             return;
//           }
//           this.recordError();
//           reject(error);
//         } finally {
//           // 记录任务耗时
//           this.totalDuration += performance.now() - startTime;
//           this.currentConcurrency--;
//           if (options.abortKey) {
//             this.abortControllers.delete(options.abortKey);
//           }
//           this.tryAdjustConcurrency();
//           this.runNext();
//           this.reportMetrics();
//         }
//       };

//       this.enqueueTask(wrappedTask, options.priority || 'normal');
//       this.runNext();
//     });
//   }

//   /**
//    * 终止指定任务
//    * @param key 任务标识键
//    */
//   public abortTask(key: string): void {
//     const controller = this.abortControllers.get(key);
//     if (controller) {
//       controller.abort();
//       this.abortControllers.delete(key);
//     }
//   }

//   /**
//    * 添加性能监控监听器
//    * @param listener 监听函数
//    */
//   public addMetricsListener(listener: (metrics: Metrics) => void): void {
//     this.metricsListeners.add(listener);
//   }

//   // 在类中增加清理方法
//   public cleanup() {
//     this.abortControllers.forEach(ctrl => ctrl.abort());
//     this.abortControllers.clear();
//     if ('connection' in navigator && navigator.connection && this.networkChangeHandler) {
//       navigator.connection.removeEventListener('change', this.networkChangeHandler);
//     }
//   }

//   // ========== 私有方法 ==========
//   /** 入队逻辑 */
//   private enqueueTask(task: () => void, priority: TaskPriority): void {
//     if (this.priorityEnabled) {
//       switch (priority) {
//         case 'high':
//           this.highPriorityQueue.enqueue(task);
//           break;
//         case 'normal':
//           this.normalPriorityQueue.enqueue(task);
//           break;
//         case 'low':
//           this.lowPriorityQueue.enqueue(task);
//           break;
//       }
//     } else {
//       this.normalPriorityQueue.enqueue(task);
//     }
//   }

//   /** 任务调度逻辑 */
//   private runNext(): void {
//     while (
//       this.currentConcurrency < this.maxConcurrency &&
//       (this.highPriorityQueue.length > 0 || this.normalPriorityQueue.length > 0 || this.lowPriorityQueue.length > 0)
//     ) {
//       const queue = this.getTaskQueue();
//       const task = queue.dequeue();
//       if (task) task();
//     }
//   }

//   /** 获取当前最高优先级队列 */
//   private getTaskQueue(): LinkedListQueue<() => void> {
//     if (this.highPriorityQueue.length > 0) return this.highPriorityQueue;
//     if (this.normalPriorityQueue.length > 0) return this.normalPriorityQueue;
//     return this.lowPriorityQueue;
//   }

//   /** 创建超时Promise */
//   private createTimeoutPromise<T>(timeout = 5000): Promise<T> {
//     return new Promise((_, reject) => setTimeout(() => reject(new Error('任务超时')), timeout));
//   }

//   /** 创建终止Promise */
//   private createAbortPromise<T>(signal: AbortSignal): Promise<T> {
//     return new Promise((_, reject) => {
//       const handleAbort = () => {
//         signal.removeEventListener('abort', handleAbort);
//         reject(new DOMException('任务已终止', 'AbortError'));
//       };
//       signal.addEventListener('abort', handleAbort);
//     });
//   }

//   /** 判断是否可重试错误 */
//   private isRetryableError(error: unknown): error is Error {
//     return error instanceof Error && !(error instanceof DOMException && error.name === 'AbortError') && !error.message.includes('任务超时');
//   }

//   /** 启动重试处理器 */
//   private startRetryProcessor(): void {
//     setInterval(() => {
//       while (this.retryQueue.length > 0) {
//         const task = this.retryQueue.dequeue();
//         if (task) this.enqueueTask(task, 'low');
//       }
//     }, 5000);
//   }

//   // ========== 并发调整逻辑 ==========
//   /** 尝试调整并发度 */
//   private tryAdjustConcurrency(): void {
//     if (!this.autoAdjust) return;

//     const now = Date.now();
//     if (now - this.lastAdjustTime < 5000) return;

//     const total = this.successCount + this.errorCount;
//     if (total < 10) return;

//     const successRate = this.successCount / total;
//     // 添加安全除法计算
//     const avgDuration = total > 0 ? this.totalDuration / total : 0;

//     let delta = 0;
//     if (successRate > 0.95) delta = 2;
//     else if (successRate > 0.9) delta = 1;
//     else if (successRate < 0.5) delta = -2;
//     else if (successRate < 0.7) delta = -1;

//     if (avgDuration > 1000) delta -= 1;

//     const newConcurrency = Math.min(Math.max(this.maxConcurrency + delta, this.minConcurrency), this.getHardwareConcurrency());

//     if (newConcurrency !== this.maxConcurrency) {
//       this.setConcurrency(newConcurrency);
//       this.lastAdjustTime = now;
//       this.successCount = 0;
//       this.errorCount = 0;
//     }
//   }

//   /** 设置并发度（带保护） */
//   private setConcurrency(newMax: number): void {
//     this.maxConcurrency = Math.min(Math.max(newMax, this.minConcurrency), this.getHardwareConcurrency());
//     this.reportMetrics();
//   }

//   // 保存网络变化监听函数引用，用于后续清理
//   private networkChangeHandler: (() => void) | null = null;

//   // ========== 环境感知 ==========
//   /** 初始化网络感知 */
//   private setupNetworkAwareness(): void {
//     if ('connection' in navigator && navigator.connection) {
//       this.networkChangeHandler = () => {
//         // 使用类型保护
//         const connection = navigator.connection as NetworkInformation;
//         let newMax = this.calculateInitialConcurrency();

//         switch (connection.effectiveType) {
//           case '4g':
//             newMax = 8;
//             break;
//           case '3g':
//             newMax = 4;
//             break;
//           case '2g':
//             newMax = 2;
//             break;
//           case 'slow-2g':
//             newMax = 1;
//             break;
//         }

//         if (connection.saveData) newMax = Math.min(newMax, 2);
//         this.setConcurrency(newMax);
//       };

//       // 添加安全的事件监听
//       navigator.connection.addEventListener('change', this.networkChangeHandler);
//       this.networkChangeHandler();
//     }
//   }

//   // ========== 辅助方法 ==========
//   private calculateInitialConcurrency(): number {
//     const base = navigator.hardwareConcurrency || 4;
//     return Math.min(base, 6);
//   }

//   private getHardwareConcurrency(): number {
//     return navigator.hardwareConcurrency || 4;
//   }

//   private recordSuccess(): void {
//     this.successCount++;
//   }

//   private recordError(): void {
//     this.errorCount++;
//   }

//   /** 上报性能指标 */
//   private reportMetrics(): void {
//     const metrics = {
//       queueSize: this.highPriorityQueue.length + this.normalPriorityQueue.length + this.lowPriorityQueue.length,
//       currentConcurrency: this.currentConcurrency,
//       maxConcurrency: this.maxConcurrency,
//       successRate: this.successCount / (this.successCount + this.errorCount) || 0,
//       // 新增耗时指标
//       avgDuration: this.successCount + this.errorCount > 0 ? this.totalDuration / (this.successCount + this.errorCount) : 0,
//       totalDuration: this.totalDuration
//     };
//     this.metricsListeners.forEach(listener => listener(metrics));
//   }
// }

// // ==================== 类型扩展 ====================
// declare global {
//   interface Navigator {
//     readonly connection?: NetworkInformation;
//   }
// }

// // 网络信息类型定义
// interface NetworkInformation extends EventTarget {
//   readonly effectiveType: '4g' | '3g' | '2g' | 'slow-2g';
//   readonly saveData: boolean;
//   addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
// }

// interface Metrics {
//   queueSize: number;
//   currentConcurrency: number;
//   maxConcurrency: number;
//   successRate: number;
//   // 新增耗时指标
//   avgDuration: number;
//   totalDuration: number;
// }

// // ==================== 使用示例 ====================
// // 初始化控制器
// const controller = new EnhancedConcurrentControl({
//   initialConcurrency: 4,
//   autoAdjust: true,
//   priority: true
// });

// // 添加监控
// controller.addMetricsListener(metrics => {
//   console.log('当前指标:', metrics);
// });

// // 添加任务
// const task = (signal: AbortSignal) => fetch('/api', { signal }).then(r => r.json());

// controller.addTask(task, {
//   priority: 'high',
//   timeout: 3000,
//   abortKey: 'main-task'
// });

// // 取消任务
// controller.abortTask('main-task');

// // // 明确任务类型示例
// // const numericTask = (signal: AbortSignal) => new Promise<number>(resolve => setTimeout(() => resolve(42), 1000));

// // controller
// //   .addTask(numericTask, {
// //     priority: 'high',
// //     timeout: 500
// //   })
// //   .then(result => {
// //     console.log(result.toFixed(2)); // 现在result明确为number类型
// //   });
