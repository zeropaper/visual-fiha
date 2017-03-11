'use strict';
var assign = require('lodash.assign');
var ScreenLayerControlView = require('./../control-view');
var SVGDetailsView = require('./details-view');

module.exports = ScreenLayerControlView.types.SVG = ScreenLayerControlView.extend({
  template: `<section class="default-layer-control">
    <header class="columns">
      <div class="column no-grow gutter-right"><button class="active prop-toggle"></button></div>
      <div class="column no-grow gutter-horizontal"><button class="edit-css vfi-cog-alt"></button></div>
      <h3 class="column layer-name gutter-left" data-hook="name"></h3>
    </header>

    <div class="preview gutter-horizontal"></div>

    <div class="mappings props"></div>
  </section>`,

  events: assign(ScreenLayerControlView.prototype.events, {
    'click .edit-css': '_editSVGStyles'
  }),

  session: {
    svgStyles: ['object', true, function() { return {}; }]
  },

  _showDetails: function () {
    this.rootView.showDetails(new SVGDetailsView({
      parent: this,
      model: this.model
    }));
  },

  _editSVGStyles: function () {
    var view = this;
    var editorView = view.rootView.getEditor();

    var cssStr = '';

    var styles = view.model.svgStyles;
    var selectors = Object.keys(styles);
    selectors.forEach(function(selector) {
      cssStr += `${ selector } {\n  ${ styles[selector].split(';').map(s => s.trim()).join(';\n  ').trim() }\n}`;
    });


    editorView.editCode({
      script: cssStr,
      language: 'css',
      onvalidchange: function (str) {
        var parsed = {};
        str.split(/([^\{\}]+\{[^\{\}]+\})/igm).forEach(function(match) {
          match = match.trim();
          if (!match) return;
          match = match.split('{').map(s => s.split('}')[0].trim());
          parsed[match[0]] = match[1];
        });

        view.sendCommand('propChange', {
          path: 'layers.' + view.model.getId(),
          property: 'svgStyles',
          value: parsed
        });
      }
    });
  }
});