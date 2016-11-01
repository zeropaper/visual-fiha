'use strict';
var VFDeps = window.VFDeps;
var View = VFDeps.View;
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
  template: [
    '<div class="midi-access">',
    '<div class="midi-inputs">',
    '<div class="gutter">Inputs</div>',
    '<ul>',
    '</ul>',
    '</div>',
    '<div class="midi-outputs">',
    '<div class="gutter">Outputs</div>',
    '<ul>',
    '</ul>',
    '</div>',
    '</div>'
  ].join(''),

  render: function() {
    this.renderWithTemplate();
    this.inputsView = this.renderCollection(this.model.inputs, MIDIView, '.midi-inputs ul');
    this.outputsView = this.renderCollection(this.model.outputs, MIDIView, '.midi-outputs ul');
    return this;
  }
});

module.exports = MIDIAccessView;