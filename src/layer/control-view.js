'use strict';
var View = require('./../controller/control-view');
var DetailsView = require('./../controller/details-view');

var LayerControlView = View.extend({
  template: '<section class="default-layer-control">' +
    '<header class="columns">' +
      '<div class="column no-grow"><button class="active prop-toggle"></button></div>' +
      '<h3 class="column layer-name gutter-left" data-hook="name"></h3>' +
    '</header>' +

    '<div class="preview gutter-horizontal"></div>' +

    '<div class="mappings props"></div>' +
  '</section>',

  // events: {
  //   'mouseenter': '_highlight',
  //   'mouseleave': '_highlight',
  //   'click .remove-layer': '_removeLayer',
  //   'click .active.prop-toggle': '_toggleActive',
  //   'click .layer-name': '_showDetails'
  // },

  commands: {
    'mouseenter': '_highlight',
    'mouseleave': '_highlight',
    'click .remove-layer': '_removeLayer',
    'click .active.prop-toggle': '_toggleActive',
    'click .layer-name': '_showDetails'
  },

  _highlight: function(evt) {
    this.model.uiState = evt.type === 'mouseenter' ? 'highlighted' : '';
  },

  _removeLayer: function() {
    this.model.collection.remove(this.model);
  },

  _toggleActive: function () {
    this.model.toggle('active');
  },

  _showDetails: function () {
    this.rootView.showDetails(new DetailsView({
      parent: this,
      model: this.model
    }));
  },

  bindings: {
    'model.uiState': {
      type: 'class'
    },
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

LayerControlView.types = {};

module.exports = LayerControlView;