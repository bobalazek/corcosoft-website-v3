const { merge } = require('webpack-merge');
const path = require('path');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  watch: true,
  /*
  // only if it's in a docker container
  watchOptions: {
    poll: 250,
    ignored: ['node_modules/**'],
  },
  */
  devServer: {
    watchContentBase: true,
    open: true,
    hot: true,
    compress: true,
    transportMode: 'ws',
    // host: '0.0.0.0', // only if it's in a docker container
  },
});
