const baseWebpackConfiguration = require('./base');
const webpack = require('webpack');

const developmentWebpackConfiguration = Object.assign(baseWebpackConfiguration, {
  devtool: 'eval-source-map',
  devServer: {
    contentBase: './dist',
    hot: true
  }
});

developmentWebpackConfiguration.plugins.push(new webpack.HotModuleReplacementPlugin());
developmentWebpackConfiguration.plugins.push(new webpack.NamedModulesPlugin());
developmentWebpackConfiguration.plugins.push(new webpack.NoEmitOnErrorsPlugin());

module.exports = developmentWebpackConfiguration;
