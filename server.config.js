
const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => ({
  output: path.join(__dirname, 'dist'),
  client: {
    main: {
      entry: './test/client/index.js',
      uri: '/',
    },
  },
  options: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'test/'),
      },
    },
  },
})