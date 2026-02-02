// 声明 process 类型以避免 TypeScript 错误
declare const process: {
  env: {
    NODE_ENV?: 'development' | 'production';
  };
};

// 后端地址 - 动态获取
const getBaseURL = () => {
  // 开发环境
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    return 'http://localhost:7000';
  }

  // 生产环境 - 根据当前域名动态设置
  const currentHost = window.location.host;
  const protocol = window.location.protocol;

  // 明确支持的域名列表
  const supportedDomains = ['eggshell.asia', 'www.eggshell.asia'];

  // 支持 eggshell.asia 和 www.eggshell.asia
  if (supportedDomains.includes(currentHost)) {
    return `${protocol}//${currentHost}/image`;
  }

  // 默认回退
  return 'https://eggshell.asia/image';
};

export const BASE_URL = getBaseURL();
