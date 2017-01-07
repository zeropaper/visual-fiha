var resolve = require('path').resolve;
var validate = require('webpack-validator');
module.exports = function(env) {
  env = env || {};
  return validate({
    context: resolve(__dirname, 'src'),
    entry: {
      'canvas-scripts':'./layer/canvas/scripts/index.js',
      'controller':'./controller-app.js',
      'screen':'./screen-app.js'
    },
    output: {
      filename: '[name]-build.js'
    },
    // http://cheng.logdown.com/posts/2016/03/25/679045
    // devtool: env.prod ? 'cheap-module-source-map' : 'cheap-module-eval-source-map',
    devtool: 'source-map',

    devServer: {
      host: 'localhost',
      inline: true,
      contentBase: __dirname,
      port: 8081
    }
  });
};