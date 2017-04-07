'use strict';
var View = require('ampersand-view');

var ControlScreenControls = View.extend({
  template: `<div class="column columns control-screen-controls">
    <div class="column no-grow">
      <button name="control-screen">Control screen</button>
    </div>

    <div class="column no-grow columns control-screen-size">
      <input type="text" placeholder="400x300" name="control-screen-size" />
    </div>
  </div>`,

  props: {
    active: ['boolean', true, true],
    width: ['number', true, 400],
    height: ['number', true, 300],
  },

  events: {
    'click [name="control-screen"]': 'toggleActive',
    'change [name="control-screen-size"]': '_handleChange'
  },

  bindings: {
    width: {
      type: function(el) {
        if (document.activeElement === el) return;
        el.value = this.width + 'x' + this.height;
      },
      selector: '[name=control-screen-size]'
    },
    height: {
      type: function(el) {
        if (document.activeElement === el) return;
        el.value = this.width + 'x' + this.height;
      },
      selector: '[name=control-screen-size]'
    }
  },

  toggleActive: function() {
    this.toggle('active');
  },

  _handleChange: function(evt) {
    var parts = (evt.target.value || '400x300').split('x').map(v => Number(v));
    this.width = parts[0] || 400;
    this.height = parts[1] || 300;
    return this;
  }
});
module.exports = ControlScreenControls;