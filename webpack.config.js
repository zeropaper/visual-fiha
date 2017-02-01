var resolve = require('path').resolve;
module.exports = function(env) {
  env = env || {};
  return {
    context: resolve(__dirname, 'src'),
    entry: {
      'controller':'./controller-app.js',
      'screen':'./screen-app.js'
    },
    output: {
      filename: '[name]-build.js'
    },
    // http://cheng.logdown.com/posts/2016/03/25/679045
    // devtool: env.prod ? 'cheap-module-source-map' : 'cheap-module-eval-source-map',
    devtool: env.prod ? 'source-map' : 'eval-source-map',

    devServer: {
      clientLogLevel: 'error',
      host: 'localhost',
      inline: true,
      contentBase: __dirname
    }
  };
};