export const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    console.log('测试existingScript', existingScript);
    if (existingScript) {
      console.log('测试111');
      resolve(); // 如果脚本已经存在，直接 resolve
      return;
    }
    console.log('测试222');

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.async = true;
    script.onload = () => {
      // console.log('脚本加载完成:', src);
      console.log('脚本加载完成');
      resolve();
    };
    script.onerror = (err) => {
      console.error('脚本加载失败:', src, err);
      reject(err);
    };
    document.head.appendChild(script);
  });
};
