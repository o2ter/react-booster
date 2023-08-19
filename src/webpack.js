/* eslint no-var: 0 */

const _ = require('lodash');
const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BootstrapPlugin } = require('@o2ter/react-route/dist/webpack');

const CWD = process.cwd();
const serverConfig = require(path.resolve(CWD, 'server.config.js'));

module.exports = (env, argv) => {

  const config = _.isFunction(serverConfig) ? serverConfig(env, argv) : serverConfig;
  const IS_PRODUCTION = argv.mode !== 'development';

  const babelLoaderConfiguration = {
    test: /\.(ts|tsx|m?js)?$/i,
    use: {
      loader: 'babel-loader',
      options: {
        compact: IS_PRODUCTION,
        cacheDirectory: true,
        presets: [
          [
            '@babel/preset-react',
            {
              development: !IS_PRODUCTION,
            },
          ],
          '@babel/preset-typescript',
        ],
        plugins: [
          '@babel/plugin-transform-runtime',
          '@babel/plugin-syntax-dynamic-import',
          '@babel/plugin-proposal-class-properties',
          'react-native-reanimated/plugin',
          '@loadable/babel-plugin',
        ]
      },
    },
    resolve: {
      fullySpecified: false,
    },
  };

  const cssLoaderConfiguration = ({ outputFile }) => ({
    test: /\.(css|sass|scss)$/,
    use: [
      outputFile && MiniCssExtractPlugin.loader,
      'css-loader',
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: [
              'autoprefixer',
            ],
          }
        }
      },
      'sass-loader',
    ].filter(Boolean),
  });

  const imageLoaderConfiguration = {
    test: /\.(gif|jpe?g|a?png|svg)$/i,
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[contenthash].[ext]',
        publicPath: '/images',
        outputPath: '/images',
      }
    }
  };

  const fontLoaderConfiguration = {
    test: /\.ttf$/i,
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[contenthash].[ext]',
        publicPath: '/fonts',
        outputPath: '/fonts',
      }
    }
  };

  const webpackConfiguration = {
    mode: IS_PRODUCTION ? 'production' : 'development',
    devtool: IS_PRODUCTION ? false : 'cheap-module-source-map',
    optimization: {
      minimize: IS_PRODUCTION,
      minimizer: [
        new TerserPlugin({
          parallel: true,
          extractComments: false,
          terserOptions: {
            sourceMap: false,
            compress: true,
            format: {
              comments: !IS_PRODUCTION,
            },
          },
        }),
      ],
    },
    experiments: {
      topLevelAwait: true,
    },
    resolve: {
      alias: {
        'react-native$': 'react-native-web',
        'url': 'whatwg-url',
      },
      extensions: [
        '.web.tsx', '.web.jsx', '.tsx', '.tsx',
        '.web.ts', '.web.mjs', '.web.js',
        '.ts', '.ts', '.mjs', '...'
      ]
    },
    output: config.output,
    externals: config.externals,
  };

  const webpackPlugins = [
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    new webpack.DefinePlugin({ __DEV__: JSON.stringify(!IS_PRODUCTION) }),
    new LoadablePlugin({ outputAsset: false }),
    new Dotenv({ path: path.join(CWD, '.env') }),
    ...(config.webpackPlugins ?? []),
  ];

  const themes = config.themes ? path.resolve(CWD, config.themes) : path.resolve(__dirname, './common/themes');

  return [
    ..._.map(config.client, ({ entry }, name) => ({
      ...webpackConfiguration,
      plugins: webpackPlugins,
      entry: {
        [name]: path.resolve(__dirname, './client/index.js'),
      },
      resolve: {
        ...webpackConfiguration.resolve,
        alias: {
          ...webpackConfiguration.resolve.alias,
          __APPLICATION__: path.resolve(CWD, entry),
        },
        fallback: {
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
        },
      },
      module: {
        rules: [
          babelLoaderConfiguration,
          cssLoaderConfiguration({ outputFile: true }),
          imageLoaderConfiguration,
          fontLoaderConfiguration,
        ]
      }
    })),
    {
      ...webpackConfiguration,
      plugins: [
        ...webpackPlugins,
        new webpack.DefinePlugin({
          __APPLICATIONS__: `[${_.map(config.client, (x, k) => `{
            uri: ${JSON.stringify(x.uri)},
            APPLICATION: __APP$${k}__,
          }`).join(',')}]`,
        }),
        new BootstrapPlugin({
          themes: path.relative(CWD, themes),
          output: '../themes.json',
        }),
        new webpack.ProvidePlugin(_.fromPairs(
          _.map(config.client, ({ entry }, name) => ([`__APP$${name}__`, path.resolve(CWD, entry)]))
        )),
      ],
      target: 'node',
      entry: {
        '../server': path.resolve(__dirname, './server/index.js'),
      },
      resolve: {
        ...webpackConfiguration.resolve,
        alias: {
          ...webpackConfiguration.resolve.alias,
          __SERVER__: path.resolve(CWD, config.serverEntry),
          __THEMES__: themes,
        },
      },
      module: {
        rules: [
          babelLoaderConfiguration,
          cssLoaderConfiguration({ outputFile: false }),
          imageLoaderConfiguration,
          fontLoaderConfiguration,
        ]
      },
      performance: {
        hints: false,
      }
    }
  ];
};
