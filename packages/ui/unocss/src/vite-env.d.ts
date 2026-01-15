/// <reference types="vite/client" />

// 全局类型声明
interface Window {
  matchMedia: (query: string) => MediaQueryList;
}

interface Console {
  log(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  info(...args: unknown[]): void;
}

declare const document: Document;
declare const window: Window;
declare const console: Console;
declare const setTimeout: typeof globalThis.setTimeout;
declare const clearTimeout: typeof globalThis.clearTimeout;
declare const setInterval: typeof globalThis.setInterval;
declare const clearInterval: typeof globalThis.clearInterval;
declare const HTMLButtonElement: typeof globalThis.HTMLButtonElement;
declare const HTMLInputElement: typeof globalThis.HTMLInputElement;
declare const HTMLElement: typeof globalThis.HTMLElement;
