/*jshint node: true*/
'use strict';
var marked = require('marked');
var mkdirp = require('mkdirp').sync;
var fs = require('fs');
var resolve = require('path').resolve;
var dirname = require('path').dirname;
var webpack = require('webpack');

var srcPath = resolve(__dirname, 'src');
var destPath = resolve(__dirname, 'gh-pages');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var readFileSync = fs.readFileSync;
var writeFileSync = fs.writeFileSync;



function MarkItDownPlugin(options) {
  this.files = options.files;
  this.cwd = options.cwd;
  this.dest = options.dest;
}

MarkItDownPlugin.prototype.apply = function(compiler) {
  var files = this.files;
  var cwd = this.cwd;
  var dest = this.dest;

  compiler.plugin('emit', function(compilation, callback) {

    files.forEach(function (transformedFilePath) {
      var src = readFileSync(resolve(cwd, transformedFilePath), 'utf8');

      var out = '';
      var startTag = 'marked-start';
      var openTag;

      src.split(/<!--\s*(marked-start\s+[^\s]+|marked-end)\s*-->/igm)
        .forEach(function(piece) {
          var filepath;

          if (piece.indexOf('marked-start') === 0) {
            openTag = true;
            filepath = piece.slice(startTag.length).trim();
            out = out + '<!-- marked-start ' + filepath + ' -->\n';
            out = out + marked(readFileSync(resolve(cwd, filepath), 'utf8'));
          }
          else if (piece.indexOf('marked-end') === 0) {
            out = out + '\n<!-- marked-end -->';
            openTag = false;
          }
          else if (!openTag) {
            out = out + piece;
          }
        });

      var absPath = resolve(dest, transformedFilePath);
      mkdirp(dirname(absPath));
      writeFileSync(absPath, out);
    });

    callback();
  });
};


function ConcatPlugin(options) {
  this.files = options.files;
  this.cwd = options.cwd;
  this.dest = options.dest;
}

ConcatPlugin.prototype.apply = function(compiler) {
  var files = this.files;
  var cwd = this.cwd;
  var dest = this.dest;

  compiler.plugin('emit', function(compilation, callback) {
    var concatenated = '';
    console.info('creating %s', dest);
    var filepath;
    files.forEach(function (file) {
      filepath = resolve(cwd, file);
      console.info('  adding %s', filepath);

      concatenated += readFileSync(filepath, 'utf8');
    });

    mkdirp(dirname(dest));
    writeFileSync(dest, concatenated);

    callback();
  });
};



module.exports = function(env) {
  var acePath = resolve(__dirname, 'node_modules/ace-builds/src');

  env = env || {};
  return {
    context: srcPath,
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
        'three'
      ],
    },

    output: {
      path: destPath,
      filename: '[name]-build.js'
    },

    devtool: env.prod ? 'source-map' : 'inline-source-map',

    plugins: [
      new MarkItDownPlugin({
        cwd: srcPath,
        dest: destPath,
        files: [
          'index.html'
        ]
      }),

      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: 'vendor-build.js'
      }),

      new CopyWebpackPlugin([
        {from: resolve(__dirname, 'assets/styles.css'), to: 'assets/styles.css'},
        {from: resolve(__dirname, 'assets/font/vf-embedded.css'), to: 'assets/font/vf-embedded.css'},
        {from: 'setup.js'},
        {from: 'controller.html'},
        {from: 'screen.html'},
        {from: resolve(acePath, 'worker-javascript.js')},
        {from: resolve(acePath, 'worker-css.js')}
      ]),

      new ConcatPlugin({
        cwd: acePath,
        dest: resolve(destPath, 'ace-build.js'),
        files: [
          'ace.js',
          'ext-beautify.js',
          'ext-error_marker.js',
          'ext-language_tools.js',
          'ext-searchbox.js',
          'ext-settings_menu.js',
          'ext-split.js',
          'ext-statusbar.js',
          'ext-whitespace.js',
          'mode-css.js',
          'mode-javascript.js',
          'mode-svg.js',
          'mode-yaml.js',
          'snippets/text.js',
          'snippets/css.js',
          'snippets/javascript.js',
          'snippets/yaml.js',
          'theme-github.js',
          'theme-monokai.js'
        ]
      })
    ],

    devServer: {
      clientLogLevel: 'error',
      host: 'localhost',
      contentBase: destPath,// needed for the plugins
      inline: true
    }
  };
};