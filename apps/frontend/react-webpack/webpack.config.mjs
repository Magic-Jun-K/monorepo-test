import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { merge } from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import CSSMinimizerPlugin from 'css-minimizer-webpack-plugin';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import os from 'node:os';

// import devConfig from './webpack.config.dev.mjs';
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

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (match) {
      const key = match[1];
      const value = match[2].trim();
      envVariables[key] = value;
    }
  });

  return envVariables;
}

// 读取 .env 文件中的所有环境变量
const envVariables = parseEnvFile();

const devConfig = {
  mode: 'development',
  devtool: 'source-map', // 方便调试的 Source Map
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'public'),
      publicPath: '/' // 设置静态资源的公共路径
    },
    port: 3000,
    open: true, // 启动时自动打开浏览器
    hot: true, // 热更新
    historyApiFallback: true, // 处理SPA路由
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:7000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    ],
    // 开发环境禁用错误覆盖层（不推荐）
    client: {
      overlay: false // 禁用错误覆盖
    }
  }
};

const baseConfig = env => {
  const isProd = env?.production;
  const analyzeMode = env?.ANALYZE === 'true';
  console.log('测试当前环境：', env, isProd);
  console.log('测试env.ANALYZE', env.ANALYZE);

  return {
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
      publicPath: '/',
      path: path.resolve(__dirname, 'build'),
      filename: 'js/[name].[contenthash:8].js',
      chunkFilename: 'js/[name].[contenthash:8].chunk.js',
      clean: true
    },
    module: {
      rules: [
        // {
        //   test: /\.(ts|tsx)$/,
        //   use: {
        //     loader: 'ts-loader',
        //     options: {
        //       // 加快构建速度，跳过类型检查
        //       transpileOnly: true
        //     }
        //   },
        //   exclude: /node_modules/
        // },
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
                poolTimeout: isProd ? 2000 : Infinity
              }
            },
            {
              loader: 'swc-loader', // 替换ts-loader为更快的SWC
              options: {
                jsc: {
                  parser: {
                    syntax: 'typescript',
                    tsx: true
                  },
                  transform: {
                    react: {
                      runtime: 'automatic'
                    }
                  },
                  minify: isProd
                    ? {
                        compress: {
                          drop_console: true, // 移除console.log
                          drop_debugger: true, // 移除debugger
                          unused: true, // 移除未使用的代码
                          dead_code: true // 移除死代码
                        },
                        mangle: true // 混淆变量名
                      }
                    : undefined
                }
              }
            }
          ],
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader']
        },
        {
          test: /\.scss$/,
          exclude: /\.module\.scss$/,
          use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'sass-loader']
        },
        {
          test: /\.module\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1, // 指定在 css-loader 处理之前，先应用几个 loader
                modules: {
                  mode: 'local', // 指定使用局部样式名
                  localIdentName: '[local]--[hash:base64:5]', // 指定局部样式名的格式
                  auto: true, // 自动生成类名
                  namedExport: false, // 指定是否使用命名导出
                  exportLocalsConvention: 'camelCase' // 指定导出的局部变量名格式
                }
              }
            },
            'sass-loader'
          ]
        },
        {
          test: /\.(jpe?g|png|webp|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[hash][ext]',
            publicPath: './'
          },
          exclude: /node_modules/,
          parser: {
            dataUrlCondition: {
              maxSize: 4 * 1024 // 4KB以下转base64
            }
          }
        },
        {
          // SVG单独处理（使用官方维护方案）
          test: /\.svg$/i,
          // use: [
          //   {
          //     loader: '@svgr/webpack',
          //     options: {
          //       svgoConfig: {
          //         plugins: [
          //           { name: 'removeViewBox', active: false }, // 移除 viewBox
          //           { name: 'convertColors', params: { currentColor: true } }, // 转换颜色
          //         ]
          //       }
          //     }
          //   }
          // ]
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
                        { name: 'convertPathData' } // 优化路径数据
                      ]
                    }
                  }
                }
              ]
            },
            {
              type: 'asset/resource',
              parser: {
                dataUrlCondition: {
                  maxSize: 4 * 1024 // 4KB 内联
                }
              },
              generator: {
                filename: 'svg/[hash][ext]',
                publicPath: './'
              }
            }
          ]
        },
        {
          test: /\.(woff2?|ttf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[contenthash:8][ext]'
          },
          include: path.resolve(__dirname, 'src/assets/fonts')
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
        filename: 'index.html' // 输出文件名
      }),
      isProd &&
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css',
          chunkFilename: 'css/[id].[contenthash:8].css'
        }),
      isProd &&
        new ImageMinimizerPlugin({
          test: /\.(jpe?g|png|webp|gif)$/i, // 排除 SVG
          deleteOriginalAssets: false, // 不删除原文件
          minimizer: {
            implementation: ImageMinimizerPlugin.sharpMinify,
            options: {
              encodeOptions: {
                jpeg: {
                  quality: 80, // 设置压缩质量 (100 接近无损)
                  mozjpeg: true, // 启用 mozjpeg 优化算法
                  progressive: true // 渐进式加载
                },
                png: {
                  quality: 85, // 设置压缩质量 (100 接近无损)
                  compressionLevel: 9, // PNG压缩级别最高（0-9）
                  effort: 9 // 优化力度最大（0-10）
                },
                webp: {
                  quality: 80, // WebP 质量（需小于100才能触发有损压缩）
                  lossless: false, // 关闭无损模式以减小体积
                  nearLossless: true // 近无损模式
                }
              },
              // 大于4KB且未被转成base64的图片才压缩
              filter: source => source.byteLength > 4096
            }
          }
        }),
      // 使用 DefinePlugin 注入环境变量
      new DefinePlugin({
        'process.env': JSON.stringify(envVariables) // 直接传入读取到的环境变量
      }),
      isProd &&
        new BundleAnalyzerPlugin({
          // analyzeMode为true时，打包自动打开报告页面
          analyzerMode: analyzeMode ? 'server' : 'disabled', // 分析模式，'server' 或 'disabled'
          openAnalyzer: analyzeMode, // 不自动打开报告页面
          generateStatsFile: false // 不生成stats文件
        })
    ],
    optimization: {
      // 压缩
      minimize: isProd,
      concatenateModules: false, // 禁用模块联级
      runtimeChunk: 'single', // 添加运行时单独打包
      moduleIds: 'deterministic', // 保持模块id稳定
      minimizer: [
        new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true, // 移除 console
              drop_debugger: true, // 移除 debugger
              ecma: 2015,
              passes: 3 // 压缩次数
            },
            format: {
              comments: /@license/i // 移除注释，仅保留license注释
            }
          },
          extractComments: true // 将license注释提取到单独的文件中
        }),
        new CSSMinimizerPlugin({
          parallel: true,
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                cssDeclarationSorter: true
              }
            ]
          }
        })
      ],
      splitChunks: {
        chunks: 'all', // 对所有类型的 chunks 进行代码分割，包括同步和异步 chunks
        // 任何小于 20,000 字节（约 20 KB）的 chunk 都不会被分割出来，而是会保留在它们原来的 chunk 中
        // 只有当一个 chunk 的大小达到或超过 20 KB 时，Webpack 才会考虑将其分割
        minSize: 100000, // 生成的 chunk 的最小大小（以字节为单位）。小于此大小的 chunk 不会被分割
        maxSize: 300000, // 允许更大的chunk尺寸。如果设置了 maxSize，Webpack 将尝试将 chunk 分割成更小的部分。0 表示不限制 chunk 的最大大小。
        minChunks: 2, // 最少有多少个 chunks（模块）共享此模块时才会分割代码
        maxAsyncRequests: 20, // 对于异步加载（动态 import）的最大并行请求数
        maxInitialRequests: 20, // 入口点的最大并行请求数
        automaticNameDelimiter: '~', // 自动生成的 chunk 名称的分隔符
        cacheGroups: {
          reactVendor: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/,
            name: 'react-core',
            priority: 70, // 最高优先级确保独立打包
            chunks: 'all',
            reuseExistingChunk: true, // 重用已经存在的 chunk
            enforce: true // 强制分离
          },
          dataGridVendor: {
            test: /[\\/]node_modules[\\/]@glideapps[\\/]/,
            name: 'data-grid',
            priority: 60,
            reuseExistingChunk: true,
            minSize: 80000,
            enforce: true
          },
          stylesVendor: {
            name: 'styles',
            test: /\.(css|scss)$/,
            chunks: 'all',
            enforce: true,
            priority: 55,
            minSize: 30000
          },
          // 新增 echarts 独立包
          echartsVendor: {
            test: /[\\/]node_modules[\\/]echarts[\\/]/,
            name: 'echarts',
            priority: 45,
            enforce: true
          },
          // 高频更新工具库 (单独分包)
          utilsHot: {
            test: /[\\/]node_modules[\\/]lodash[\\/]/,
            name: 'utils-hot',
            priority: 40,
            minSize: 0, // 强制独立
            chunks: 'all', // 所有类型的 chunks 都可以使用这个缓存组,
            enforce: true, // 强制独立打包
            reuseExistingChunk: true // 重用已经存在的 chunk
          },
          // 低频稳定工具库 (合并)
          utilsStable: {
            test: /[\\/]node_modules[\\/]axios[\\/]/,
            name: 'utils-stable',
            priority: 35,
            minSize: 50000 // 50KB 以上才独立打包, 否则合并到vendors
          },
          corejs: {
            test: /[\\/]node_modules[\\/]core-js[\\/]/,
            name: 'core-js',
            priority: 30,
            enforce: true,
            reuseExistingChunk: true, // 增加重用
            chunks: 'async' // 仅异步加载
          },
          uiVendor: {
            test: /[\\/]node_modules[\\/]@eggshell[\\/]/,
            name: 'ui-vendor',
            priority: 15
          },
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            reuseExistingChunk: true,
            minSize: 150000,
            maxSize: 300000
          }
          // 用于控制如何形成块的缓存组
          // defaultVendors: {
          //   test: /[\\/]node_modules[\\/]/, // 过滤条件，匹配 node_modules 文件夹下的模块
          //   priority: -10, // 优先级，决定了一个模块可以属于多个缓存组时的优先选择。数值越高，优先级越高
          //   reuseExistingChunk: true // 如果当前 chunk 中已有这个模块，则重用，而不是创建一个新的 chunk
          // },
          // default: {
          //   minChunks: 2, // 至少有 2 个 chunk 引用时才会生成一个新的 chunk
          //   priority: -20, // 优先级较低的默认组
          //   reuseExistingChunk: true // 重用已经存在的 chunk 而不是创建新的 chunk
          // }
        }
      }
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    cache: {
      type: 'filesystem',
      version: process.env.NODE_ENV, // 不同环境使用不同缓存版本
      // version: `${process.env.NODE_ENV}-${Date.now()}`, // 添加时间戳强制刷新缓存
      cacheDirectory: path.resolve(__dirname, '.webpack_temp_cache'),
      buildDependencies: {
        config: [__filename]
      },
      allowCollectingMemory: true // 允许内存回收
    },
    watchOptions: {
      ignored: /node_modules/
    },
    externals: {
      BMapGL: 'BMapGL'
    }
  };
};
export default env => merge(baseConfig(env), env?.production ? prodConfig : devConfig);
