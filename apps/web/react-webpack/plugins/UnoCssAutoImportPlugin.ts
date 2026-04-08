import webpack from 'webpack';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

interface UnoCssAutoImportPluginOptions {
  packageName?: string;
  cssPath?: string;
  debug?: boolean;
}

/**
 * 自动引入unocss-ui CSS文件的Webpack插件
 * 当检测到项目中使用了unocss-ui的组件时，自动引入对应的CSS文件
 */
class UnoCssAutoImportPlugin {
  private options: Required<UnoCssAutoImportPluginOptions>;

  constructor(options: UnoCssAutoImportPluginOptions = {}) {
    this.options = {
      // unocss-ui包名
      packageName: '@eggshell/ui-unocss',
      // CSS文件路径（相对于node_modules中的包路径）
      cssPath: 'lib/index.css',
      // 是否启用调试模式
      debug: false,
      ...options
    };
  }

  // 插件入口
  apply(compiler: webpack.Compiler) {
    const pluginName = 'UnoCssAutoImportPlugin';
    const { packageName, cssPath, debug } = this.options;

    // 在编译开始时，检查依赖并自动引入CSS
    compiler.hooks.beforeCompile.tapPromise(pluginName, async () => {
      try {
        // 检查是否安装了unocss-ui包
        const packageJsonContent = await readFile(
          resolve(compiler.context, 'package.json'),
          'utf-8'
        );
        const packageJson = JSON.parse(packageJsonContent);
        const dependencies = {
          ...packageJson.dependencies,
          ...packageJson.peerDependencies,
          ...packageJson.devDependencies
        };

        if (dependencies[packageName]) {
          // 尝试解析CSS文件路径
          const cssFilePath = resolve(compiler.context, 'node_modules', packageName, cssPath);

          if (debug) {
            console.log(
              `[${pluginName}] Found ${packageName}, will auto-import CSS from ${cssFilePath}`
            );
          }

          // 直接添加CSS文件到编译入口
          const EntryPlugin = webpack.EntryPlugin;
          new EntryPlugin(compiler.context, cssFilePath, {
            name: `${packageName}-css`
          }).apply(compiler);
        }
      } catch (error) {
        if (debug) {
          console.warn(
            `[${pluginName}] Error checking dependencies:`,
            error instanceof Error ? error.message : String(error)
          );
        }
      }
    });
  }
}
export default UnoCssAutoImportPlugin;