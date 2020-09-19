const path = require('path');
const glob = require('glob');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');

module.exports = {
  entry: {
    main: path.resolve(__dirname, 'src', 'index.ts'),
  },
  output: {
    filename: 'static/js/[name].[hash:8].js',
    chunkFilename: 'static/js/[name].[hash:8].chunk.js',
    path: path.resolve(__dirname, 'build'),
  },
  devtool: 'source-map',
  context: __dirname,
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'static/css/[name].[contenthash:8].css',
      chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'public'),
          to: './',
          globOptions: {
            ignore: [
              'index.html', // already handled by HtmlWebpackPlugin
            ],
          },
        },
      ],
    }),
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
      generate: (seed, files, entrypoints) => {
        return {
          files: files.reduce((manifest, file) => {
            manifest[file.name] = file.path;
            return manifest;
          }, seed),
          entrypoints: entrypoints.main.filter(
            fileName => !fileName.endsWith('.map')
          ),
        };
      },
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
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            sourceMap: true,
            esModuleInterop: true,
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          // { loader: 'style-loader' }, // for inline styles
          { loader: 'css-loader' },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('autoprefixer'),
                ],
              },
            },
          },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.(jpg|png|gif|env|dds|glb|gltf|stl)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: false,
              name: 'static/media/[name].[hash].[ext]',
            },
          },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}
