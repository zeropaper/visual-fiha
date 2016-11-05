'use strict';
var assign = window.VFDeps.assign;
var DetailsView = require('./../controller/details-view');
var TransformationControlView = require('./../transformation/control-view');
var transformationFunctions = require('./../transformation/functions');
var SignalDetailsView = DetailsView.extend({
  template: [
    '<section>',
    '<header>',
    '<h3>Details for <span data-hook="name"></span></h3>',
    '</header>',

    '<div class="row mappings props"></div>',

    '<div class="row gutter transformations-control columns">',
    '<div class="column gutter-right" data-placeholder="New transformation" data-hook="new-transformation-name" contenteditable="true"></div>',
    '<div class="column gutter-left no-grow"><button name="add-transformation" class="vfi-plus"></button></div>',
    '</div>',
    '<div class="row transformations props"></div>',
    '</section>'
  ].join('\n'),

  subviews: assign({}, DetailsView.prototype.subviews, {
    transformationsView: {
      selector: '.transformations',
      prepareView: function (el) {
        return this.renderCollection(this.model.transformations, TransformationControlView, el);
      }
    }
  }),

  events: {
    'click [name=add-transformation]': '_addTransformation',

    'focus [data-hook=new-transformation-name]': '_focusName'
  },

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

  _focusName: function() {
    this.rootView.suggestionHelper.attach(this.queryByHook('new-transformation-name')).fill(Object.keys(transformationFunctions));
  },

  _addTransformation: function () {
    this.model.transformations.add({
      name: this.queryByHook('new-transformation-name').textContent.trim()
    });
  },

  bindings: {
    'model.name': '[data-hook=name]'
  }
});
module.exports = SignalDetailsView;