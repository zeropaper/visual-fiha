/*jshint node: true*/
module.exports = function(config) {
  'use strict';
  var specsPattern = process.env.KARMA_PATTERN || '**/*-spec.js';
  // console.info('specsPattern', specsPattern);

  // preprocess matching files before serving them to the browser
  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  var preprocessors = {};
  // add webpack as preprocessor
  preprocessors['test/' + specsPattern] = ['webpack'];


  var configuration = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    preprocessors: preprocessors,

    // list of files / patterns to load in the browser
    files: Object.keys(preprocessors).map(function(pattern) {
      return {pattern: pattern, watched: false};
    }).concat([
      {pattern: './assets/styles.css', included: true, served: true, watched: false, nocache: true},
      {pattern: './assets/font/*', included: false, served: true, watched: false, nocache: true},
      {pattern: './screen.html', included: false, served: true, watched: false, nocache: true}
    ]),


    // list of files to exclude
    exclude: [
    ],


    webpack: {
      devtool: 'inline-source-map'
      // devtool: 'cheap-module-eval-source-map'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 8082,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_ERROR,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    customLaunchers: {
      ChromeTravisCI: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          '--use-fake-ui-for-media-stream'
        ]
      },
      ChromeMediaOK: {
        base: 'Chrome',
        flags: [
          '--use-fake-ui-for-media-stream'
        ]
      }
    },

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeMediaOK'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  };

  if(process.env.TRAVIS) {
    configuration.browsers = ['ChromeTravisCI'];
  }
  config.set(configuration);
};
