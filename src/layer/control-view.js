'use strict';
var View = window.VFDeps.View;
var DetailsView = require('./../controller/details-view');
var LayerControlView = View.extend({
  template: '<section class="default-layer-control">' +
    '<header class="columns">' +
      '<div class="column no-grow gutter-right"><button class="active prop-toggle"></button></div>' +
      '<h3 class="column layer-name gutter-left" data-hook="name"></h3>' +
    '</header>' +

    '<div class="preview gutter-horizontal"></div>' +

    '<div class="mappings props"></div>' +
  '</section>',

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

  events: {
    'click .remove-layer': '_removeLayer',
    'click .active.prop-toggle': '_toggleActive',
    'click .layer-name': '_showMappings'
  },

  _removeLayer: function() {
    this.model.collection.remove(this.model);
  },

  _toggleActive: function () {
    this.model.toggle('active');
  },

  _showMappings: function (evt) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this._detailsView = this._detailsView || new DetailsView({
      parent: this,
      model: this.model,
    });
    this.rootView.showDetails(this._detailsView);
  },

  bindings: {
    'model.active': [
      {
        type: 'booleanClass',
        name: 'disabled',
        invert: true
      },

      {
        type: 'booleanClass',
        selector: '.active.prop-toggle',
        yes: 'vfi-toggle-on',
        no: 'vfi-toggle-off'
      }
    ],
    'model.name': {
      hook: 'name',
      type: 'text'
    },
    'model.type': [
      {
        hook: 'type',
        type: 'text'
      },
      {
        type: 'class'
      }
    ]
  }
});
module.exports = LayerControlView;