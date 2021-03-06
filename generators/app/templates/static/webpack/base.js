const log = require('log');
const _ = require('lodash');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const entries = require('./entries');
const config = require('./config.json');
const path = require('path');

var jsEntries = {};
var htmlEntries = [];

const development = process.env.NODE_ENV === 'dev';

// Process entries file
_.forOwn(entries, (entry, name) => {
  if (typeof entry === 'string') {
    jsEntries[name] = entry;
    htmlEntries.push(
      new HtmlWebpackPlugin({ template: `src/${name}.${config.defaultTemplate}` })
    );
  } else {
    if (!entry.file) {
      log.error(`Entry object ${name} is missing the file property`);
      return;
    }
    jsEntries[name] = entry.file;
    if (!entry.noHTML) {
      htmlEntries.push(
        new HtmlWebpackPlugin({
          chunks: [name],
          title: name,
          template: `src/${name}.${entry.template || config.defaultTemplate}`
        })
      );
    }
  }
});

const extractCss = new ExtractTextPlugin({
  filename: 'assets/[name].[contenthash].css',
  disable: development
});

const baseWebpackConfiguration = {
  entry: jsEntries,
  output: {
    filename: 'assets/[name].[hash].js',
    path: path.resolve(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: extractCss.extract({
          use: [
            {
              loader: "css-loader",
              options: {
                sourceMap: development,
                minimize: !development
              }
            },
            {
              loader: "postcss-loader",
              options: {
                plugins: development ? undefined : [require('autoprefixer')()]
              }
            }
          ],
          fallback: "style-loader"
        })
      },
      {
        test: /\.scss$/,
        use: extractCss.extract({
          use: [
            { 
              loader: "css-loader", 
              options: {
                sourceMap: development,
                minimize: !development
              } 
            },
            {
              loader: "postcss-loader",
              options: {
                sourceMap: development,
                plugins: development ? undefined : [require('autoprefixer')()]
              }
            },
            { 
              loader: "sass-loader",
              options: {
                sourceMap: development
              }
            }
          ],
          fallback: "style-loader"
        })
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/fonts/[name].[ext]'
        }
      },
      {
        test: /\.(jpg|png|gif)$/,
        loader: 'file-loader',
        options: {
          name: 'assets/images/[name].[ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      actions: path.resolve(__dirname, '../src/actions/'),
      components: path.resolve(__dirname, '../src/components/'),
      containers: path.resolve(__dirname, '../src/containers/'),
      reducers: path.resolve(__dirname, '../src/reducers/'),
      stores: path.resolve(__dirname, '../src/stores/')
    }
  },
  plugins: htmlEntries.concat([
    extractCss
  ])
};

module.exports = baseWebpackConfiguration;
