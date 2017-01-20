'use strict';

module.exports = {
  lines: require('./lines'),
  loaders: require('./loaders'),
  text: require('./text'),
  utils: require('./utils')
};

if (typeof window !== 'undefined') {
  window.VF = window.VF || {};
  window.VF.canvas = module.exports;
}
