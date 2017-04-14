'use strict';
var View = require('./../controller/control-view');
var LayerDetailsView = require('./details-view');
var objectPath = require('./../object-path');

var LayerControlView = View.extend({
  template: `
    <section class="default-layer-control">
      <header class="columns">
        <div class="column no-grow"><button class="active prop-toggle"></button></div>
        <div class="column no-grow"><button class="edit-css vfi-code"></button></div>
        <h5 class="column no-grow layer-type"><span data-hook="type"></span></h5>
        <h3 class="column layer-name gutter-horizontal" data-hook="name"></h3>
        <div class="column no-grow text-right"><button class="vfi-trash-empty remove-layer"></button></div>
      </header>

      <div class="preview gutter-horizontal"></div>

      <div class="mappings props"></div>
    </section>
  `,

  events: {
    'click .edit-css': '_editLayerStyles',
    'click .layer-name': '_showDetails'
  },


  _showDetails: function () {
    var DetailsViewConstructor = LayerDetailsView.types ? LayerDetailsView.types[this.model.getType()] : false;
    DetailsViewConstructor = DetailsViewConstructor || LayerDetailsView;
    this.rootView.showDetails(new DetailsViewConstructor({
      parent: this,
      model: this.model
    }));
  },

  _editLayerStyles: function () {
    var view = this;
    var rootView = view.rootView;
    var editorView = rootView.getEditor();
    var id = view.model.getId();
    editorView.editCode({
      script: '#' + id + ' {\n' + this.model.layerStyles + '\n}',
      language: 'css',
      title: id + ' layer styles',
      onshoworigin: function() {
        rootView.trigger('blink', 'layers.' + id);
      },
      autoApply: true,
      onvalidchange: function (str) {
        var cleaned = str.split('{').pop().split('}').shift().trim();
        view.sendCommand('propChange', {
          path: 'layers.' + id,
          property: 'layerStyles',
          value: cleaned
        });
      }
    });
  },

  commands: {
    'click .remove-layer': 'removeLayer _layerName',
    'click .active.prop-toggle': 'propChange _toggleActive'
  },

  _layerName: function() {
    return {
      layerName: this.model.name
    };
  },

  _toggleActive: function() {
    return {
      path: objectPath(this.model),
      property: 'active',
      value: !this.model.active
    };
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
  },

  derived: {
    modelPath: {
      deps: ['model'],
      fn: function() {
        return objectPath(this.model);
      }
    }
  }
});

LayerControlView.types = {};

module.exports = LayerControlView;