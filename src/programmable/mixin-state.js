'use strict';

module.exports = function programmableState(config, prototype = {}) {
  // var update = config.update;
  var setup = config.setup;

  prototype.props = prototype.props || {};
  prototype.derived = prototype.derived || {};

  prototype.props.updateFunction = ['string', true, ''];

  if (!setup) return prototype;

  prototype.props.setupFunction = ['string', true, ''];

  return prototype;
};