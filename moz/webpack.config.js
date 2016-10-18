var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    './resources/public/js/compiled/app.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].bundle.js',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.ejs',
    }),
    new CopyWebpackPlugin([
/*      { from: 'resources/public/css', to: 'css' },
      { from: 'resources/public/images', to: 'images' },
      { from: 'resources/public/favicon.ico', to: '' }*/
    ])
  ],
  module: {
     loaders: [{
         test: /\.js$/,
         exclude: /node_modules/,
         loader: 'script'
     }]
  }
};
