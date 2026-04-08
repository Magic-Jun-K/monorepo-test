import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { merge } from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CSSMinimizerPlugin from 'css-minimizer-webpack-plugin';
// import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { sentryWebpackPlugin } from '@sentry/webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
// import { createRequire } from 'node:module';

// import UnoCssAutoImportPlugin from './plugins/UnoCssAutoImportPlugin.ts';
import devConfig from './webpack.config.dev.mjs';

const prodConfig = { mode: 'production' };

// 模拟 CommonJS 的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// const require = createRequire(import.meta.url);

const { DefinePlugin } = webpack;

// 读取 .env 文件并解析环境变量
function parseEnvFile() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVariables = {};

  envContent.split('\n').forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2].replace(/['"]/g, '').trim(); // 移除引号
      envVariables[key] = value;
    }
  });

  return envVariables;
}

// 读取 .env 文件中的所有环境变量
const envVariables = parseEnvFile();

// const devConfig = {
//   mode: 'development',
//   devtool: 'source-map', // 方便调试的 Source Map
//   devServer: {
//     static: {
//       directory: path.resolve(__dirname, 'public'),
//       publicPath: '/' // 设置静态资源的公共路径
//     },
//     port: 3000,
//     open: true, // 启动时自动打开浏览器
//     hot: true, // 热更新
//     historyApiFallback: true, // 处理SPA路由
//     proxy: [
//       {
//         context: ['/api'],
//         target: 'http://localhost:7000',
//         changeOrigin: true,
//         pathRewrite: { '^/api': '' }
//       }
//     ],
//     // 开发环境禁用错误覆盖层（不推荐）
//     client: {
//       overlay: false // 禁用错误覆盖
//     }
//   }
// };

const baseConfig = (env) => {
  // 更好地处理环境变量
  const isProd = env && env.production;
  // const isDev = env && env.development;
  const analyzeMode = env && env.ANALYZE === 'true';

  console.log('测试当前环境：', env, isProd);
  console.log('测试env.ANALYZE', env?.ANALYZE);
  console.log('当前 __dirname:', __dirname);
  console.log('src 路径:', path.join(__dirname, 'src'));
  console.log('components 路径:', path.join(__dirname, 'src', 'components'));

  return {
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
      publicPath: '/',
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].[contenthash:8].js',
      chunkFilename: 'js/[name].[contenthash:8].chunk.js',
      clean: true,
    },
    module: {
      rules: [
        // {
        //   test: /\.(ts|tsx)$/,
        //   use: {
        //     loader: 'babel-loader',
        //     options: {
        //       presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
        //       cacheDirectory: true
        //     }
        //   },
        //   exclude: /node_modules/
        // },
        {
          test: /\.(ts|tsx)$/,
          use: [
            {
              loader: 'thread-loader',
              options: {
                workers: os.cpus().length - 1, // CPU 核心数减一
                // 开发模式下，设置Infinity保持线程存活（避免频繁重启）
                poolTimeout: isProd ? 2000 : Infinity,
              },
            },
            {
              loader: 'swc-loader', // 替换ts-loader为更快的SWC
              options: {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                    tsx: true,
                  },
                  transform: {
                    react: {
                      runtime: 'automatic',
                    },
                  },
                  minify: isProd
                    ? {
                        compress: {
                          drop_console: true, // 移除console.log
                          drop_debugger: true, // 移除debugger
                          unused: true, // 移除未使用的代码
                          dead_code: true, // 移除死代码
                        },
                        mangle: true, // 混淆变量名
                      }
                    : undefined,
                },
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
        {
          test: /\.scss$/,
          exclude: /\.module\.scss$/,
          use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'sass-loader'],
        },
        {
          test: /\.module\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2, // 指定在 css-loader 处理之前，先应用几个 loader。这里为2，因为现在有sass-loader和postcss-loader
                modules: {
                  mode: 'local', // 指定使用局部样式名
                  localIdentName: isProd ? '[hash:base64:5]' : '[local]--[hash:base64:5]', // 指定局部样式名的格式
                  auto: true, // 自动生成类名
                  namedExport: false, // 指定是否使用命名导出
                  exportLocalsConvention: 'camelCase', // 指定导出的局部变量名格式
                },
              },
            },
            'postcss-loader', // 添加postcss-loader支持Autoprefixer等
            'sass-loader',
          ],
        },
        {
          test: /\.(jpe?g|png|webp|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[contenthash][ext]',
          },
          exclude: /node_modules/,
          parser: {
            dataUrlCondition: {
              maxSize: 4 * 1024, // 4KB以下转base64
            },
          },
        },
        {
          // SVG单独处理（使用官方维护方案）
          test: /\.svg$/i,
          oneOf: [
            {
              resourceQuery: /react/,
              use: [
                {
                  loader: '@svgr/webpack',
                  options: {
                    svgoConfig: {
                      plugins: [
                        { name: 'removeViewBox', active: false }, // 移除 viewBox
                        { name: 'removeTitle' }, // 移除<title>
                        { name: 'removeDesc' }, // 移除<desc>
                        { name: 'removeEmptyAttrs' }, // 移除空属性
                        { name: 'collapseGroups' }, // 合并分组
                        { name: 'convertPathData' }, // 优化路径数据
                      ],
                    },
                  },
                },
              ],
            },
            {
              type: 'asset/resource',
              parser: {
                dataUrlCondition: {
                  maxSize: 4 * 1024, // 4KB 内联
                },
              },
              generator: {
                filename: 'svg/[hash][ext]',
                publicPath: './',
              },
            },
          ],
        },
        {
          test: /\.(woff2?|ttf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[contenthash:8][ext]',
          },
          include: path.resolve(__dirname, 'src/assets/fonts'),
        },
        {
          test: /\.md$/,
          type: 'asset/resource',
          generator: {
            emit: false,
          },
        },
        {
          test: /\.wasm$/,
          type: 'asset/resource',
          generator: {
            filename: 'wasm/[name].[hash][ext]',
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
        filename: 'index.html', // 输出文件名
        // templateParameters: {
        //   isProd: isProd,
        // },
        // 添加CSP nonce支持
        cspPlugin: {
          enabled: true,
          policy: {
            'default-src': "'self'",
            'script-src': "'self' 'unsafe-inline'",
            'style-src': "'self' 'unsafe-inline'",
            'img-src': "'self' data: blob:",
          },
        },
      }),
      // Sentry Webpack 插件
      isProd &&
        sentryWebpackPlugin({
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: 'your-org-name',
          project: 'eggshell/react-webpack',
          sourcemaps: {
            assets: ['./dist/js/*.js', './dist/js/*.js.map'],
          },
          release: {
            name: process.env.RELEASE_VERSION || 'dev',
            deploy: {
              env: process.env.NODE_ENV || 'development',
            },
          },
        }),
      // 自动引入unocss-ui CSS文件的插件
      // new UnoCssAutoImportPlugin({
      //   debug: !isProd // 开发环境启用调试模式
      // }),
      isProd &&
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css',
          chunkFilename: 'css/[id].[contenthash:8].css',
        }),
      // isProd &&
      //   new ImageMinimizerPlugin({
      //     test: /\.(jpe?g|png|webp|gif)$/i, // 排除 SVG
      //     deleteOriginalAssets: false, // 不删除原文件
      //     minimizer: {
      //       implementation: ImageMinimizerPlugin.sharpMinify,
      //       options: {
      //         encodeOptions: {
      //           jpeg: {
      //             quality: 80, // 设置压缩质量 (100 接近无损)
      //             mozjpeg: true, // 启用 mozjpeg 优化算法
      //             progressive: true // 渐进式加载
      //           },
      //           png: {
      //             quality: 85, // 设置压缩质量 (100 接近无损)
      //             compressionLevel: 9, // PNG压缩级别最高（0-9）
      //             effort: 9 // 优化力度最大（0-10）
      //           },
      //           webp: {
      //             quality: 80, // WebP 质量（需小于100才能触发有损压缩）
      //             lossless: false, // 关闭无损模式以减小体积
      //             nearLossless: true // 近无损模式
      //           }
      //         }
      //       }
      //     }
      //   }),
      // 使用 DefinePlugin 注入环境变量
      new DefinePlugin({
        'process.env': JSON.stringify({
          ...envVariables,
          NODE_ENV: isProd ? 'production' : 'development', // 确保 NODE_ENV 正确设置
        }),
        process: JSON.stringify({}), // 定义 process 对象，避免 "process is not defined" 错误
      }),
      // 分析包大小
      analyzeMode && new BundleAnalyzerPlugin(),
      // 生产环境开启Gzip压缩
      isProd &&
        new CompressionPlugin({
          test: /\.(js|css|html|svg)$/,
          algorithm: 'gzip',
          threshold: 10240, // 大于10kb的文件才压缩
          minRatio: 0.8,
        }),
    ].filter(Boolean),
    // 生产环境优化
    optimization: {
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: isProd,
              drop_debugger: isProd,
            },
          },
        }),
        new CSSMinimizerPlugin(),
      ],
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
            name: 'vendors',
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            name: 'react-vendors',
            priority: 20,
            chunks: 'all',
          },
          antd: {
            test: /[\\/]node_modules[\\/](antd|@ant-design)[\\/]/,
            name: 'antd',
            priority: 15,
            chunks: 'all',
          },
          echarts: {
            test: /[\\/]node_modules[\\/](echarts|zrender)[\\/]/,
            name: 'echarts',
            priority: 25,
            chunks: 'all',
          },
          three: {
            test: /[\\/]node_modules[\\/](three)[\\/]/,
            name: 'three',
            priority: 25,
            chunks: 'all',
          },
          agGrid: {
            test: /[\\/]node_modules[\\/](ag-grid-community|ag-grid-react)[\\/]/,
            name: 'ag-grid',
            priority: 25,
            chunks: 'all',
          },
          libs: {
            test: /[\\/]node_modules[\\/](axios|dayjs|zustand|@tanstack|react-hook-form|zod|@hookform)[\\/]/,
            name: 'libs',
            priority: 20,
            chunks: 'all',
          },
          animation: {
            test: /[\\/]node_modules[\\/](framer-motion|gsap)[\\/]/,
            name: 'animation',
            priority: 20,
            chunks: 'all',
          },
          sentry: {
            test: /[\\/]node_modules[\\/](@sentry)[\\/]/,
            name: 'sentry',
            priority: 20,
            chunks: 'all',
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: 'single', // 将runtime代码单独抽离
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      // 确保只有一个 React 实例
      modules: [
        'node_modules',
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, '../../../node_modules'),
      ],
    },
    cache: isProd
      ? false
      : {
          type: 'filesystem',
          version: process.env.NODE_ENV, // 不同环境使用不同缓存版本
          cacheDirectory: path.resolve(__dirname, '.webpack_temp_cache'),
          buildDependencies: {
            config: [__filename],
          },
          allowCollectingMemory: true, // 允许内存回收
        },
    watchOptions: {
      ignored: /node_modules/,
    },
    externals: isProd
      ? {
          BMapGL: 'BMapGL',
          // react: 'React',
          // 'react-dom': 'ReactDOM',
          // three: 'THREE',
        }
      : {},
  };
};
export default (env) => merge(baseConfig(env), env?.production ? prodConfig : devConfig);
