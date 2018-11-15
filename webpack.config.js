const Dotenv = require('dotenv-webpack');

module.exports = {
  externals: {
    serialport: true,
  },
  plugins: [
    new Dotenv(),
  ],
};
