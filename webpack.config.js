/* eslint-disable import/no-commonjs */

// Webpack configuration cannot be written with ES6 import/export so we disable no-commonjs.

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
