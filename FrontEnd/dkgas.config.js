const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve('../Backend/public'),
    filename: 'main.js'
  },

  // devtool: 'inline-source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
    }
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
      },
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "html-loader",
          }
        ]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false }
          },
          'sass-loader'
        ],
        exclude: /node_modules/i
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        exclude: /node_modules/,
        use: [
          { loader: 'file-loader' },
        ]
      },
      {
        test: /\.mp3$/,
        loader: 'file-loader',
        options: {
          name: '/assets/audios/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./index.html",
      filename: "./index.html"
    })
  ]
};
