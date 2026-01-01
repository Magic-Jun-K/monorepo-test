// 后端地址 - 动态获取
const getBaseURL = () => {
  // console.log('import.meta.env.MODE', import.meta.env.MODE);
  // 开发环境
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:7100';
  }

  // 生产环境 - 根据当前域名动态设置
  const currentHost = window.location.host;
  const protocol = window.location.protocol;

  // 明确支持的域名列表
  const supportedDomains = ['eggshell.online', 'www.eggshell.online'];

  // 支持 eggshell.online 和 www.eggshell.online
  if (supportedDomains.includes(currentHost)) {
    return `${protocol}//${currentHost}/image`;
  }

  // 默认回退
  return 'http://eggshell.online/image';
};

export const BASE_URL = getBaseURL();
