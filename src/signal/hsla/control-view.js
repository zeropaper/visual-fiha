'use strict';
var assign = require('lodash.assign');
var SignalControlView = require('./../control-view');
var HSLASignalControlView = SignalControlView.types.hsla = SignalControlView.extend({
  template: [
    '<section class="rows signal signal-color">',
    '<header class="row">',
    '<h3 class="name"></h3>',
    '</header>',

    '<div class="row columns gutter-horizontal gutter-bottom">',
    '<div class="column result-color no-grow"></div>',
    '<div class="column result gutter-left"></div>',
    '</div>',

    '<div class="row mappings props"></div>',
    '</section>'
  ].join(''),

  bindings: assign({}, SignalControlView.prototype.bindings, {
    'model.result': [
      {
        selector: '.result-color',
        type: function(el, val) {
          el.style.backgroundColor = val;
        }
      },
      {
        selector: '.result',
        type: 'text'
      }
    ]
  })
});
module.exports = HSLASignalControlView;