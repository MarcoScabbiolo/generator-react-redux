const log = require('log');
const _ = require('lodash');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const entries = require('./entries');
const config = require('./config.json');
const path = require('path');

var jsEntries = {};
var htmlEntries = [];

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

const baseWebpackConfiguration = {
  entry: jsEntries,
  output: {
    filename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
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
  plugins: htmlEntries.concat([])
};

module.exports = baseWebpackConfiguration;
