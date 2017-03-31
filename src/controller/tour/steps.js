'use strict';
module.exports = function(controllerView) {
  return [
    {
      title: 'Screen layers',
      name: 'layers',
      selector: '.region-right .region-content',
      text: 'The layers provide a way to compose an screen with different types of media.<br/>'+
        'The aspect of a layer can be influenced by preset or custom variables.',
      prepare: function() {
        controllerView.regionRight.focusTab('Layers');
      }
    },
    {
      title: 'Adding a layer',
      name: 'layer-add',
      selector: 'section.layers header',
      text: 'You can add a layer here by giving it a name, choosing its type and clicking on the <span class="vfi-plus"></span> button.',
      prepare: function() {
        controllerView.regionRight.focusTab('Layers');
      }
    },
    {
      title: 'Layer details',
      name: 'layer-details',
      selector: 'section.layers>.items .svg-layer-control:nth-child(2) .layer-name',
      text: 'Click on a layer name to open its details.',
      prepare: function() {
        controllerView.regionRight.focusTab('Layers');
        controllerView.layersView.items.views[1]._showDetails();
      }
    },
    {
      title: 'Layer variables',
      name: 'layer-variables',
      selector: '.style-props',
      text: 'The CSS variables defined here can then be used in the style editor.<br/>'+
        'Try adding a variable name "<code>--rotation</code>" with its value "<code>calc(0.05deg * var(--frametime))</code>".<br/>'+
        'The "<code>--frametime</code>" variable is a "screen" variable (and is available to all layers).',
      prepare: function() {
        controllerView.regionRight.focusTab('Layers');
        setTimeout(function() {
          controllerView.layersView.items.views[1]._showDetails();
        }, 100);
      }
    },
    {
      title: 'Layer styles',
      name: 'layer-styles',
      selector: 'section.layers>.items .svg-layer-control:nth-child(2) .edit-css',
      text: 'Each layer can be styled with CSS. To do so, click the <span class="vfi-code"></span> button in the layers tab.<br/>'+
        'Try adding<br/>'+
        ' "<code>transform: rotate(var(--rotation));</code>" between the brakets.',
      prepare: function() {
        var tour = this;
        controllerView.regionRight.focusTab('Layers');
        setTimeout(function() {
          controllerView.layersView.items.views[1]._editLayerStyles();
          var editorEl = document.querySelector('.region-right .region-content');
          tour.setPosition(editorEl).blinkFocused(editorEl);
        }, 2000);
      }
    },
    {
      title: 'Signals',
      name: 'signals',
      selector: '.region-right .region-content',
      text: 'Using signals allow to create complex variables which can be used to control the layer transformations.',
      prepare: function() {
        controllerView.regionRight.focusTab('Signals');
      }
    },
    {
      title: 'Mappings',
      name: 'mappings',
      selector: '.region-right .region-content',
      text: 'Mappings are the glue to connect signal outputs to layer variables.',
      prepare: function() {
        controllerView.regionRight.focusTab('Mappings');
      }
    },
    {
      title: 'MIDI',
      name: 'midi',
      selector: '.region-left-bottom .region-content',
      text: 'If you have a (supported) MIDI controller, plug it in you are ready map its events to your signal or layer variables.',
      prepare: function() {
        controllerView.regionLeftBottom.focusTab('MIDI');
      }
    },
    {
      title: 'Audio',
      name: 'audio',
      selector: '.region-left-bottom .region-content',
      text: 'Audio settings description',
      prepare: function() {
        controllerView.regionLeftBottom.focusTab('Audio');
      }
    },
    {
      name: 'setup-editor-button',
      selector: '[name=setup-editor]',
      text: 'Setup editor button description',
      prepare: function() {
      }
    },
    {
      name: 'setup-editor',
      selector: '.region-right .region-content',
      text: 'Setup editor description',
      prepare: function() {
        controllerView._setupEditor();
      }
    }
  ];
};