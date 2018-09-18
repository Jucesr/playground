const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/index',
  output: {
    path: path.join(__dirname, 'public', 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    },{
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ]
    }]
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname ,'public'),
    historyApiFallback: true
  }
}
