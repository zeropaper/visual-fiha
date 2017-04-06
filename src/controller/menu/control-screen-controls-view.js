'use strict';
var View = require('ampersand-view');

var ControlScreenControls = View.extend({
  template: `<div class="column columns control-screen-controls">
    <div class="column no-grow">
      <button name="control-screen">Control screen</button>
    </div>

    <div class="column no-grow columns control-screen-size">
      <div class="column">
        <input type="number" min="25" max="75" name="control-screen-width" />
      </div>

      <div class="column">
        <input type="number" min="25" max="75" name="control-screen-height" />
      </div>
    </div>
  </div>`,

  props: {
    active: ['boolean', true, true],
    width: ['number', true, 33],
    height: ['number', true, 33],
  },

  bindings: {
    'width': {type: 'value', selector: '[name="control-screen-width"]'},
    'height': {type: 'value', selector: '[name="control-screen-height"]'}
  },

  events: {
    'click [name="control-screen"]': 'toggleActive',
    'change [name="control-screen-width"]': 'setWidth',
    'change [name="control-screen-height"]': 'setHeight'
  },

  toggleActive: function() {
    this.toggle('active');
  },

  setWidth: function(evt) {
    this.width = Number(evt.target.value);
  },

  setHeight: function(evt) {
    this.height = Number(evt.target.value);
  }
});
module.exports = ControlScreenControls;