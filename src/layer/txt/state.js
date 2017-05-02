'use strict';
var LayerState = require('./../state');
var TxtLayerState = LayerState.types.txt = LayerState.extend({
  baseParameters: [
    {name: 'text', type: 'string', default: ''}
  ].concat(LayerState.prototype.baseParameters),

  derived: {
    text: {
      deps: ['parameters.text'],
      fn: function() {
        return this.parameters.getValue('text');
      }
    }
  }
});
module.exports = TxtLayerState;