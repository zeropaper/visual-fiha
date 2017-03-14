/*jshint node: true*/
'use strict';
var resolve = require('path').resolve;
var webpack = require('webpack');

module.exports = function(env) {
  env = env || {};
  return {
    context: resolve(__dirname, 'src'),
    entry: {
      'controller':'./controller-app.js',
      'screen':'./screen-app.js',
      vendor: [
        'ampersand-collection',
        'ampersand-events',
        'ampersand-router',
        'ampersand-state',
        'ampersand-view',
        'ampersand-view-switcher',
        'js-yaml',
        'localforage',
        'lodash.assign',
        'lodash.debounce',
        'lodash.throttle',
        'lodash.uniq',
        'ramda',
      ],
    },

    output: {
      filename: '[name]-build.js'
    },
    // http://cheng.logdown.com/posts/2016/03/25/679045
    // devtool: env.prod ? 'cheap-module-source-map' : 'cheap-module-eval-source-map',
    devtool: env.prod ? 'source-map' : 'inline-source-map',

    plugins: [
      new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor-build.js'})
    ],

    devServer: {
      clientLogLevel: 'error',
      host: 'localhost',
      inline: true,
      contentBase: __dirname
    }
  };
};