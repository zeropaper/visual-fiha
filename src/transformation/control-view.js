'use strict';
var View = window.VFDeps.View;
var TransformationControlView = View.extend({
  template: '<div class="transformation gutter columns">' +
      '<div class="column gutter-right text-right" data-hook="name"></div>' +
      '<div class="column gutter-horizontal no-grow"><button name="remove" class="vfi-trash-empty"></button></div>' +
      '<input class="column gutter-left" data-hook="arguments" type="text"/>' +
    '</div>',

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    },
    arguments: {
      deps: ['model', 'model.arguments'],
      fn: function() {
        return (this.model.arguments || []).join(',');
      }
    }
  },

  parseArguments: function(value) {
    var state = this.model;
    value = (value || this.queryByHook('arguments').value).trim();
    var math = state.name.indexOf('math.') === 0;
    var values = value.split(',').map(function(arg) {
      arg = math ? Number(arg) : arg;
      arg = math && isNaN(arg) ? 0 : arg;
      return arg;
    });
    this.model.arguments = values;
  },

  bindings: {
    'model.name': '[data-hook=name]',
    'model.arguments': {
      hook: 'arguments',
      type: function(el) {
        if (el === document.activeElement) { return; }
        el.value = this.model.arguments.join(',');
      }
    }
  },

  events: {
    'click [name=remove]': '_remove',

    'keyup [data-hook=arguments]': '_changeArguments'
  },

  _remove: function() {
    this.model.collection.remove(this.model);
  },

  _changeArguments: function() {
    this.parseArguments();
  }
});

module.exports = TransformationControlView;