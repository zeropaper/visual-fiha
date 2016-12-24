var resolve = require('path').resolve;
var validate = require('webpack-validator');
module.exports = function() {
  return validate({
    context: resolve(__dirname, 'src'),
    entry: {
      'controller':'./controller-app.js',
      'screen':'./screen-app.js'
    },
    output: {
      filename: '[name]-build.js'
    },
    devtool: 'cheap-module-source-map',
    devServer: {
      host: 'localhost',
      inline: true,
      contentBase: __dirname,
      port: 8081
    }
  });
};