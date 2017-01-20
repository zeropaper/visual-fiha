'use strict';
var View = require('./../controller/control-view');
var MIDIView = View.extend({
  template: [
    '<li class="gutter">',
    '<span class="name"></span> ',
    '</li>'
  ].join(''),
  bindings: {
    'model.active': {
      type: 'booleanClass'
    },
    'model.state': '.state',
    'model.name': '.name'
  },

  events: {
    click: '_handleClick'
  },

  _handleClick: function() {
    this.model.toggle('active');
  }
});

var MIDIAccessView = View.extend({
  template:
    '<div class="midi-access">' +
      '<div class="midi-inputs">' +
        '<div class="gutter">Inputs</div>' +
        '<ul></ul>' +
      '</div>' +
    '</div>',

  render: function() {
    var originalClass;
    if (this.el) {
      originalClass = this.el.className;
    }
    this.renderWithTemplate();
    if (originalClass) {
      this.el.className = originalClass;
    }
    this.inputsView = this.renderCollection(this.model.inputs, MIDIView, '.midi-inputs ul');
    // this.outputsView = this.renderCollection(this.model.outputs, MIDIView, '.midi-outputs ul');
    return this;
  }
});

module.exports = MIDIAccessView;