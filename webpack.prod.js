const path = require('path');
const glob = require('glob');
const { merge } = require('webpack-merge');

const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new OptimizeCssAssetsPlugin(),
    ],
  },
  plugins: [
    new CompressionWebpackPlugin({
      test: /\.(css|js|svg|ttf|eot|woff|woff2)$/i,
    }),
    new PurgecssPlugin({
      paths: glob.sync(
        path.resolve(__dirname, '**', '*'),
        {
          nodir: true,
        }
      ),
      whitelistPatterns: [
        /animation--.*/, // is added by jQuery on the fly
      ],
    }),
    new CleanWebpackPlugin(),
  ],
});
