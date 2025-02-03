import { copyFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

async function copyCssFiles() {
  const files = [
    { source: 'build/es/index.css', target: 'build/es/index.css' }  // 只复制 index.css
  ];
  
  try {
    for (const file of files) {
      await mkdir(dirname(file.target), { recursive: true });
      await copyFile(file.source, file.target);
    }
    console.log('CSS files copied successfully');
  } catch (error) {
    console.error('Error copying CSS files:', error);
    process.exit(1);
  }
}

copyCssFiles();
