const path = require('path');

module.exports = {
  entry: './src/index.ts',
  target: 'node',
  output: {
    path: path.join(__dirname, '..', 'dist'),
    filename: 'main.js'
  },

  // devtool: 'inline-source-map',
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
