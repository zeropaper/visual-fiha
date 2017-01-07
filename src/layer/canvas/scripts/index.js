'use strict';
/* global module, require */

window.VF = window.VF || {};

window.VF.canvas = module.exports = {
  lines: require('./lines'),
  loaders: require('./loaders'),
  utils: require('./utils')
};
