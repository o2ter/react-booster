/* eslint no-var: 0 */

const _ = require('lodash');
const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const TerserPlugin = require('terser-webpack-plugin');
const LoadablePlugin = require('@loadable/webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BootstrapPlugin } = require('@o2ter/react-route/dist/webpack');

const serverConfig = require(path.resolve(process.cwd(), 'server.config.js'));

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
    output: {
      path: path.join(config.output, 'public'),
    },
    externals: config.externals,
  };

  const webpackPlugins = [
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    new webpack.DefinePlugin({ __DEV__: JSON.stringify(!IS_PRODUCTION) }),
    new LoadablePlugin({ outputAsset: false }),
    new Dotenv({ path: path.join(process.cwd(), '.env') }),
    ...(config.webpackPlugins ?? []),
  ];

  const themes = config.themes ? path.resolve(process.cwd(), config.themes) : path.resolve(__dirname, './common/themes');

  const random = crypto.randomUUID();
  const tempDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  const applications = path.resolve(tempDir, `applications-${random}.js`);

  fs.writeFileSync(applications, `
    ${_.map(config.client, ({ entry }, name) => `import ${name} from '${path.resolve(process.cwd(), entry)}';`).join('\n')}
    export { ${_.keys(config.client).join(',')} };
  `);

  return [
    ..._.map(config.client, ({ entry }, name) => ({
      ...webpackConfiguration,
      plugins: webpackPlugins,
      entry: {
        [`${name}_bundle`]: path.resolve(__dirname, './client/index.js'),
      },
      resolve: {
        ...webpackConfiguration.resolve,
        alias: {
          ...webpackConfiguration.resolve.alias,
          __APPLICATION__: path.resolve(process.cwd(), entry),
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
          __applications__: JSON.stringify(_.mapValues(config.client, x => ({
            path: x.uri,
            env: x.env ?? {},
          }))),
        }),
        new BootstrapPlugin({
          themes: path.relative(process.cwd(), themes),
          output: '../themes.json',
        }),
      ],
      target: 'node',
      entry: {
        '../server': path.resolve(__dirname, './server/index.js'),
      },
      resolve: {
        ...webpackConfiguration.resolve,
        alias: {
          ...webpackConfiguration.resolve.alias,
          __SERVER__: path.resolve(process.cwd(), config.serverEntry),
          __THEMES__: themes,
          __APPLICATIONS__: applications,
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
