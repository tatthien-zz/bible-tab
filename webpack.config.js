const path = require('path')
const webpack = require('webpack')
const devMode = process.env.NODE_ENV !== 'production'
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
var webpackConfig = {
  entry: './src/app.js',
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: devMode ? 'app.js' : 'app.[contenthash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        loader: 'css-loader'
      },
      {
        test: /\.scss$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'app.[contenthash].css',
      disable: process.env.NODE_ENV === 'development'
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      filename: 'index.html'
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'static'),
        to: path.resolve(__dirname, 'dist'),
        ignore: ['.*']
      }
    ])
  ],
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js'
    }
  },
  optimization: {
    minimize: !devMode,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          ecma: 6,
          compress: true,
          output: {
            comments: false,
            beautify: false
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  devtool: 'source-map',
}


if (process.env.NODE_ENV === 'production') {
  webpackConfig.plugins = (webpackConfig.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}

module.exports = webpackConfig
