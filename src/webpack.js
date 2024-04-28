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
        presets: _.compact([
          !server && ['@babel/preset-env', {
            targets: {},
            exclude: [
              '@babel/plugin-transform-regenerator',
              '@babel/plugin-transform-async-generator-functions',
              '@babel/plugin-transform-async-to-generator',
            ],
          }],
          ['@babel/preset-react', {
            development: !IS_PRODUCTION,
            runtime: 'automatic',
          }],
          '@babel/preset-typescript',
        ]),
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

  const imageLoaderConfiguration = ({ outputFile }) => ({
    test: /\.(gif|jpe?g|a?png|svg)$/i,
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[contenthash].[ext]',
        publicPath: '/images',
        outputPath: '/images',
        emitFile: outputFile,
      }
    }
  });

  const fontLoaderConfiguration = ({ outputFile }) => ({
    test: /\.ttf$/i,
    use: {
      loader: 'file-loader',
      options: {
        name: '[name].[contenthash].[ext]',
        publicPath: '/fonts',
        outputPath: '/fonts',
        emitFile: outputFile,
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
        [`${name}_bundle`]: path.resolve(__dirname, './client/index.js'),
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
          cssLoaderConfiguration({ outputFile: true }),
          imageLoaderConfiguration({ outputFile: true }),
          fontLoaderConfiguration({ outputFile: true }),
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
        server: path.resolve(__dirname, './server/index.js'),
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
          cssLoaderConfiguration({ outputFile: false }),
          imageLoaderConfiguration({ outputFile: false }),
          fontLoaderConfiguration({ outputFile: false }),
          ...config.options?.module?.rules ?? [],
        ]
      },
      performance: {
        hints: false,
      }
    }
  ];
};
