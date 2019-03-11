/* eslint-disable import/no-commonjs, webpack config does not support ES6 import/export */

const Dotenv = require('dotenv-webpack');

module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/react'],
        },
      },
    ],
  },
  externals: {
    serialport: true,
  },
  plugins: [
    new Dotenv(),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
