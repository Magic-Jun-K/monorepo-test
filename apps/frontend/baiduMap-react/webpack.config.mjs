import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { merge } from 'webpack-merge';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

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

const baseConfig = env => {
  const isProd = env?.production;
  console.log('测试当前环境：', env, isProd);

  return {
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: 'js/[name].[contenthash].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                cacheDirectory: true
              }
            },
            'ts-loader'
          ],
          exclude: /node_modules/
        },
        // {
        //   test: /\.(ts|tsx)$/,
        //   use: [
        //     {
        //       loader: 'swc-loader'
        //     },
        //     'ts-loader'
        //   ],
        //   exclude: /node_modules/
        // },
        {
          test: /\.css$/,
          use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader']
        },
        {
          test: /\.scss$/,
          exclude: /\.module\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.module\.scss$/,
          use: [
            isProd ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  mode: 'local',
                  localIdentName: '[local]--[hash:base64:5]',
                  auto: true,
                  namedExport: false,
                  exportLocalsConvention: 'camelCase'
                }
              }
            },
            'sass-loader'
          ]
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          parser: {
            dataUrlCondition: {
              maxSize: 8192 // 8KB
            }
          },
          generator: {
            filename: 'images/[name][ext][query]'
          }
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
          filename: 'css/[name].[contenthash].css'
        }),
      // 使用 DefinePlugin 注入环境变量
      new DefinePlugin({
        'process.env': JSON.stringify(envVariables) // 直接传入读取到的环境变量
      }),
      isProd && new BundleAnalyzerPlugin()
    ],
    optimization: {
      // 压缩
      minimize: isProd,
      minimizer: [
        // 使用TerserPlugin
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true
            }
          }
        })
      ],
      splitChunks: {
        chunks: 'all', // 对所有类型的 chunks 进行代码分割，包括同步和异步 chunks
        // 任何小于 20,000 字节（约 20 KB）的 chunk 都不会被分割出来，而是会保留在它们原来的 chunk 中
        // 只有当一个 chunk 的大小达到或超过 20 KB 时，Webpack 才会考虑将其分割
        minSize: 20000, // 生成的 chunk 的最小大小（以字节为单位）。小于此大小的 chunk 不会被分割
        // maxSize: 250000, // 如果设置了 maxSize，Webpack 将尝试将 chunk 分割成更小的部分。0 表示不限制 chunk 的最大大小。
        minChunks: 1, // 最少有多少个 chunks（模块）共享此模块时才会分割代码
        maxAsyncRequests: 30, // 对于异步加载（动态 import）的最大并行请求数
        maxInitialRequests: 30, // 入口点的最大并行请求数
        automaticNameDelimiter: '~', // 自动生成的 chunk 名称的分隔符
        cacheGroups: {
          // 用于控制如何形成块的缓存组
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/, // 过滤条件，匹配 node_modules 文件夹下的模块
            priority: -10, // 优先级，决定了一个模块可以属于多个缓存组时的优先选择。数值越高，优先级越高
            reuseExistingChunk: true // 如果当前 chunk 中已有这个模块，则重用，而不是创建一个新的 chunk
          },
          default: {
            minChunks: 2, // 至少有 2 个 chunk 引用时才会生成一个新的 chunk
            priority: -20, // 优先级较低的默认组
            reuseExistingChunk: true // 重用已经存在的 chunk 而不是创建新的 chunk
          }
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
      cacheDirectory: path.resolve(__dirname, '.webpack_temp_cache')
    },
    watchOptions: {
      ignored: /node_modules/
    },
    externals: {
      BMap: 'BMap',
      BMapGL: 'BMapGL'
    }
  };
};

export default env => merge(baseConfig(env), env?.production ? prodConfig : devConfig);
