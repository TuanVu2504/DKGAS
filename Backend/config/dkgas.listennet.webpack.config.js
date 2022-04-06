const path = require('path');

module.exports = {
  entry: './listenNet/index.ts',
  target: 'node',
  output: {
    path: path.join('C:','Server', 'Backend', 'dist'),
    filename: 'listennet.js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [[
              '@babel/preset-env', {
                targets: {
                  esmodules: true
                }
              }],
              '@babel/preset-react']
          }
        },
        enforce: 'pre',
        exclude: /node_modules/i
      }
    ]
  },
};
