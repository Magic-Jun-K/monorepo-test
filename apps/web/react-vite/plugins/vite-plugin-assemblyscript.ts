import { Plugin } from 'vite';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 执行命令行命令
const execAsync = promisify(exec);

// 在 ES 模块中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function assemblyscriptPlugin(): Plugin {
  return {
    name: 'vite-plugin-assemblyscript',
    async buildStart() {
      // 初始构建时编译一次
      try {
        console.log('🚀 编译AssemblyScript...');
        await execAsync('pnpm run asbuild:release');
        console.log('✅ AssemblyScript编译完成');
      } catch (error) {
        console.error('❌ AssemblyScript编译失败:', error);
      }
    },
    configureServer(server) {
      // 监听assembly目录下的文件变化
      const assemblyDir = path.resolve(__dirname, '../assembly');

      server.watcher.add(path.join(assemblyDir, '**/*.ts'));

      server.watcher.on('change', async (filePath) => {
        if (filePath.includes('assembly') && filePath.endsWith('.ts')) {
          console.log(`🔄 检测到AssemblyScript文件变化: ${filePath}`);
          try {
            console.log('🚀 重新编译AssemblyScript...');
            await execAsync('pnpm run asbuild:release');
            console.log('✅ AssemblyScript编译完成');

            // 可选：触发页面刷新
            server.ws.send({
              type: 'full-reload',
            });
          } catch (error) {
            console.error('❌ AssemblyScript编译失败:', error);
          }
        }
      });
    },
  };
}
