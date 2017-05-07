'use strict';
var assign = require('lodash.assign');
var SignalControlView = require('./../control-view');
var HSLASignalControlView = SignalControlView.types.hsla = SignalControlView.extend({
  template: `<section class="rows signal signal-color">
    <header class="columns">
      <h3 class="column signal-name gutter-horizontal" data-hook="name"></h3>
      <div class="column result-color no-grow"></div>
      <div class="column no-grow text-right"><button class="vfi-trash-empty remove-signal"></button></div>
    </header>
  </section>`,

  bindings: assign({}, SignalControlView.prototype.bindings, {
    'model.result': {
      selector: '.result-color',
      type: function(el, val) {
        el.style.backgroundColor = val;
      }
    }
  })
});
module.exports = HSLASignalControlView;