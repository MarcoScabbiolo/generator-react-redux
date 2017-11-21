const baseWebpackConfiguration = require('./base');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CleanUpPlugin = require('webpack-cleanup-plugin');

const distributionWebpackConfiguration = Object.assign(baseWebpackConfiguration, {
  devtool: 'none',
});

distributionWebpackConfiguration.plugins.push(new UglifyJsPlugin({ test: /\.(js|jsx)$/ }));
distributionWebpackConfiguration.plugins.push(new CleanUpPlugin());

module.exports = distributionWebpackConfiguration;
