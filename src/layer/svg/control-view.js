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

  initialize: function() {
    ScreenLayerControlView.prototype.initialize.apply(this, arguments);
    this._cacheEl = document.createElement('div');

    this.listenToAndRun(this.model, 'change:content', function() {
      if (!this.model.content || this._cacheEl.innerHTML === this.model.content) return;
      this._cacheEl.innerHTML = this.model.content;

      var obj = this.model.serialize();

      if (!Object.keys(obj.svgStyles).length) {
        obj.svgStyles = this.extractStyles();
        obj.styleProperties = this.extractVars();
      }

      obj.content = this._cacheEl.innerHTML;

      this.sendCommand('updateLayer', {layer: obj});
    });
  },

  extractVars: function() {
    var props = [];
    var name, value;
    var svg = this._cacheEl.getElementsByTagName('svg')[0];
    if (!svg) return props;
    for (var p = 0; p < svg.style.length; p++) {
      name = svg.style[p];
      value = svg.style.getPropertyValue(name).trim();
      props.push({
        name: name,
        value: value,
        default: value
      });
    }
    return props;
  },



  extractStyles: function() {
    var styles = {};
    var changed;
    this._cacheEl.querySelectorAll('[style][id]').forEach(function(styledEl) {
      changed = true;
      styles['#' + styledEl.id] = styledEl.getAttribute('style');
      styledEl.style = null;
    });

    return styles;
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