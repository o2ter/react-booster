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

const serverConfig = require(path.resolve(process.cwd(), 'server.config.js'));

module.exports = (env, argv) => {

  const config = _.isFunction(serverConfig) ? serverConfig(env, argv) : serverConfig;
  const IS_PRODUCTION = argv.mode !== 'development';

  const babelLoaderConfiguration = ({ server }) => ({
    test: /\.(ts|tsx|m?js)?$/i,
    use: {
      loader: 'babel-loader',
      options: {
        compact: IS_PRODUCTION,
        cacheDirectory: true,
        configFile: false,
        presets: [
          ['@babel/preset-env', {
            exclude: [
              '@babel/plugin-transform-regenerator',
              '@babel/plugin-transform-async-generator-functions',
              '@babel/plugin-transform-async-to-generator',
            ],
            targets: server ? { node: 'current' } : 'defaults',
            ...server ? {} : config.polyfills ?? {},
          }],
          ['@babel/preset-react', {
            development: !IS_PRODUCTION,
            runtime: 'automatic',
          }],
          '@babel/preset-typescript',
        ],
        plugins: [
          'react-native-reanimated/plugin',
          '@loadable/babel-plugin',
        ]
      },
    },
    resolve: {
      fullySpecified: false,
    },
  });

  const cssLoaderConfiguration = ({ server }) => ({
    test: /\.(css|sass|scss)$/,
    use: [
      !server && MiniCssExtractPlugin.loader,
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

  const imageLoaderConfiguration = ({ server }) => ({
    test: /\.(gif|jpe?g|a?png|svg)$/i,
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[contenthash].[ext]',
        publicPath: '/images',
        outputPath: '/images',
        emitFile: !server,
      }
    }
  });

  const fontLoaderConfiguration = ({ server }) => ({
    test: /\.ttf$/i,
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[contenthash].[ext]',
        publicPath: '/fonts',
        outputPath: '/fonts',
        emitFile: !server,
      }
    }
  });

  const webpackOptimization = ({ server }) => ({
    minimize: IS_PRODUCTION,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: false,
        terserOptions: {
          sourceMap: false,
          compress: true,
          keep_classnames: server,
          format: {
            comments: !IS_PRODUCTION,
          },
        },
      }),
    ],
  });

  const webpackConfiguration = {
    mode: IS_PRODUCTION ? 'production' : 'development',
    devtool: IS_PRODUCTION ? false : 'cheap-module-source-map',
    experiments: {
      topLevelAwait: true,
    },
    resolve: {
      ...config.options?.resolve ?? {},
      alias: {
        'react-native$': 'react-native-web',
        'url': 'whatwg-url',
        ...config.options?.resolve?.alias ?? {},
      },
    },
    externals: config.options?.externals,
  };

  const webpackPlugins = [
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    new webpack.DefinePlugin({ __DEV__: JSON.stringify(!IS_PRODUCTION) }),
    new LoadablePlugin({ outputAsset: false }),
    new Dotenv({ path: path.join(process.cwd(), '.env') }),
    new webpack.ProvidePlugin({
      _: 'lodash',
      React: 'react',
    }),
    ...config.options?.plugins ?? [],
  ];

  const themes = config.themes ? path.resolve(process.cwd(), config.themes) : path.resolve(__dirname, './common/themes');
  const server = config.serverEntry ? path.resolve(process.cwd(), config.serverEntry) : path.resolve(__dirname, './server/default.js');

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
      optimization: webpackOptimization({ server: false }),
      plugins: webpackPlugins,
      entry: {
        [`${name}_bundle`]: [
          'core-js/stable',
          path.resolve(__dirname, './client/index.js'),
        ],
      },
      output: {
        path: path.join(config.output, 'public'),
      },
      resolve: {
        ...webpackConfiguration.resolve,
        alias: {
          ...webpackConfiguration.resolve.alias,
          __APPLICATION__: path.resolve(process.cwd(), entry),
          __THEMES__: themes,
        },
        extensions: [
          '.web.tsx', '.web.jsx',
          '.tsx', '.tsx',
          '.web.ts', '.web.mjs', '.web.js',
          '.ts', '.ts', '.mjs',
          '...'
        ],
      },
      module: {
        rules: [
          babelLoaderConfiguration({ server: false }),
          cssLoaderConfiguration({ server: false }),
          imageLoaderConfiguration({ server: false }),
          fontLoaderConfiguration({ server: false }),
          ...config.options?.module?.rules ?? [],
        ]
      }
    })),
    {
      ...webpackConfiguration,
      optimization: webpackOptimization({ server: true }),
      plugins: [
        ...webpackPlugins,
        new webpack.DefinePlugin({
          __applications__: JSON.stringify(_.mapValues(config.client, x => ({
            path: x.uri,
            basename: x.basename,
            env: x.env ?? {},
          }))),
        }),
      ],
      target: 'node',
      entry: {
        server: [
          'core-js/stable',
          path.resolve(__dirname, './server/index.js'),
        ],
      },
      output: {
        path: config.output,
      },
      resolve: {
        ...webpackConfiguration.resolve,
        alias: {
          ...webpackConfiguration.resolve.alias,
          __APPLICATIONS__: applications,
          __THEMES__: themes,
          __SERVER__: server,
        },
        extensions: [
          '.server.tsx', '.server.jsx',
          '.web.tsx', '.web.jsx',
          '.tsx', '.tsx',
          '.server.ts', '.server.mjs', '.server.js',
          '.web.ts', '.web.mjs', '.web.js',
          '.ts', '.ts', '.mjs',
          '...'
        ],
      },
      module: {
        rules: [
          babelLoaderConfiguration({ server: true }),
          cssLoaderConfiguration({ server: true }),
          imageLoaderConfiguration({ server: true }),
          fontLoaderConfiguration({ server: true }),
          ...config.options?.module?.rules ?? [],
        ]
      },
      performance: {
        hints: false,
      }
    }
  ];
};
