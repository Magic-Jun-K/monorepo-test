import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { merge } from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import CSSMinimizerPlugin from 'css-minimizer-webpack-plugin';
// import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { sentryWebpackPlugin } from '@sentry/webpack-plugin';
// import CompressionPlugin from 'compression-webpack-plugin';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

// import UnoCssAutoImportPlugin from './plugins/UnoCssAutoImportPlugin.ts';
import devConfig from './webpack.config.dev.mjs';

const prodConfig = { mode: 'production' };

// 模拟 CommonJS 的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      path: path.resolve(__dirname, 'build'),
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
            assets: ['./build/js/*.js', './build/js/*.js.map'],
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
      isProd &&
        new BundleAnalyzerPlugin({
          // analyzeMode为true时，打包自动打开报告页面
          analyzerMode: analyzeMode ? 'server' : 'disabled', // 分析模式，'server' 或 'disabled'
          openAnalyzer: analyzeMode, // 不自动打开报告页面
          generateStatsFile: false, // 不生成stats文件
        }),
      // isProd &&
      //   new CompressionPlugin({
      //     algorithm: 'brotliCompress',
      //     test: /\.(js|css|html|svg|json|ico|ttf|woff2?)$/i,
      //     threshold: 10240,
      //     minRatio: 0.8,
      //     deleteOriginalAssets: false,
      //     compressionOptions: {
      //       level: 11,
      //     },
      //   }),
    ],
    // 优化
    optimization: {
      minimize: isProd, // 生产环境开启压缩
      concatenateModules: false,
      runtimeChunk: 'single',
      moduleIds: 'deterministic',
      removeAvailableModules: true, // 移除无用的模块
      removeEmptyChunks: true, // 移除空块
      mergeDuplicateChunks: true, // 合并重复模块
      flagIncludedChunks: true, // 标记包含的块
      // 压缩
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true, // 移除 console
              drop_debugger: true, // 移除 debugger
              ecma: 2015,
              passes: 3, // 压缩次数
            },
            format: {
              comments: /@license/i, // 移除注释，仅保留license注释
            },
          },
          extractComments: true, // 将license注释提取到单独的文件中
        }),
        new CSSMinimizerPlugin({
          parallel: true,
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                cssDeclarationSorter: true,
              },
            ],
          },
        }),
      ],
      // 代码分割
      splitChunks: {
        chunks: 'all', // 对所有类型的 chunks 进行代码分割，包括同步和异步 chunks
        minSize: 20000, // 降低最小阈值
        maxSize: 244000, // 设置合理的最大阈值
        minChunks: 2, // 确保至少被引用两次
        maxAsyncRequests: 20, // 允许同时加载的最大异步请求数
        maxInitialRequests: 20, // 允许同时加载的最大初始请求数
        automaticNameDelimiter: '~', // 分割块之间的分隔符
        cacheGroups: {
          reactVendor: {
            // test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/,
            test: /[\\/]node_modules[\\/](scheduler|react-router|react-router-dom)[\\/]/,
            name: 'react-core',
            priority: 70, // 最高优先级确保独立打包
            chunks: 'all',
            reuseExistingChunk: true, // 允许重复使用已经打包的模块
            enforce: true, // 强制打包
          },
          dataGridVendor: {
            test: /[\\/]node_modules[\\/]@glideapps[\\/]/,
            name: 'data-grid',
            priority: 60,
            reuseExistingChunk: true,
            minSize: 80000,
            enforce: true,
          },
          stylesVendor: {
            name: 'styles',
            test: /\.(css|scss)$/,
            chunks: 'all',
            enforce: true,
            priority: 55,
            minSize: 30000,
          },
          // 新增 echarts 独立包
          echartsVendor: {
            test: /[\\/]node_modules[\\//]echarts[\\/]/,
            name: 'echarts',
            priority: 45,
            enforce: true,
          },
          // 低频稳定工具库 (合并)
          utilsStable: {
            test: /[\\/]node_modules[\\/]axios[\\/]/,
            name: 'utils-stable',
            priority: 35,
            minSize: 20000,
            maxSize: 100000,
            enforce: true,
          },
          corejs: {
            test: /[\\/]node_modules[\\/]core-js[\\/]/,
            name: 'core-js',
            priority: 30,
            enforce: true,
            reuseExistingChunk: true,
            chunks: 'async',
          },
          // 自定义UI组件库分割策略
          eggshellUI: {
            test: /[\\/]node_modules[\\/]@eggshell[\\/]/,
            name: 'eggshell-ui',
            priority: 25, // 提升优先级，确保UI库被单独打包
            chunks: 'all',
            enforce: true,
            minSize: 10000, // 降低阈值确保UI库被单独打包
            maxSize: 200000,
          },
          // 更精确的UI组件分割
          antdUI: {
            test: /[\\/]node_modules[\\/]@eggshell[\\/]antd-ui[\\/]/,
            name: 'antd-ui',
            priority: 30,
            chunks: 'all',
            enforce: true,
            minSize: 5000,
            maxSize: 150000,
          },
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            reuseExistingChunk: true,
            minSize: 20000,
            maxSize: 244000,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      // 确保只有一个 React 实例
      // modules: [
      //   'node_modules',
      //   path.resolve(__dirname, 'node_modules')
      // ]
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
          react: 'React',
          'react-dom': 'ReactDOM',
          '@sentry/react': 'SentryReact',
          'web-vitals': 'WebVitals',
          three: 'THREE',
        }
      : {},
  };
};
export default (env) => merge(baseConfig(env), env?.production ? prodConfig : devConfig);
