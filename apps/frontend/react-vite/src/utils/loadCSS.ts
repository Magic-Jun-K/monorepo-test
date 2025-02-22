export const loadCSS = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) {
      resolve(); // 如果样式已经存在，直接 resolve
      return;
    }

    const link = document.createElement('link');
    link.href = href;
    link.rel = 'stylesheet';
    link.onload = () => resolve();
    link.onerror = (err) => reject(err);
    document.head.appendChild(link);
  });
};
