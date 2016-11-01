'use strict';
var View = window.VFDeps.View;
var TransformationControlView = View.extend({
  template: [
    '<div class="transformation gutter columns">',
    '<div class="column gutter-right text-right" data-hook="name"></div>',
    '<div class="column gutter-horizontal no-grow"><button name="remove" class="vfi-trash-empty"></button></div>',
    '<div class="column gutter-left" data-hook="arguments" contenteditable="true"></div>',
    '</div>'
  ].join('\n'),

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    }
  },

  bindings: {
    'model.name': '[data-hook=name]',
    'model.arguments': '[data-hook=arguments]'
  },

  events: {
    'click [name=remove]': '_remove',

    'focus [data-hook=arguments]': '_focusArguments',
    'input [data-hook=arguments]': '_changeArguments',
    'blur [data-hook=arguments]': '_blurArguments'
  },

  _remove: function() {
    this.model.collection.remove(this.model);
  },

  _focusArguments: function() {},
  _changeArguments: function() {},
  _blurArguments: function() {},
});

module.exports = TransformationControlView;