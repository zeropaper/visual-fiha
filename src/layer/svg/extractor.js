'use strict';
var State = require('ampersand-state');

var Extractor = State.extend({
  autoRender: true,
  template: '<div style="display: none"></div>',

  extractProps: function() {
    var props = [];
    var name, value;

    for (var p = 0; p < this.svg.style.length; p++) {
      name = this.svg.style[p];
      value = this.svg.style.getPropertyValue(name).trim();

      props.push({
        name: name,
        value: value,
        default: value
      });
    }

    this.svg.style = null;
    return props;
  },

  extractStyles: function() {
    var styles = {};

    this.svg.querySelectorAll('[style][id]').forEach(function(styledEl) {
      styles['#' + styledEl.id] = styledEl.getAttribute('style');
      styledEl.style = null;
    });

    return styles;
  },

  setPathLengths: function() {
    var paths = this.el.querySelectorAll('path');
    for (var p = 0; p < paths.length; p++) {
      paths[p].style.setProperty('--path-length', paths[p].getTotalLength());
    }
    return this;
  },

  _updateContent: function() {
    if (!this.el || this.el.innerHTML === this.model.content) return;
    this.el.innerHTML = this.model.content;

    this.svg = this.el.querySelector('svg');
    if (!this.svg) return;

    var layer = {};
    layer[this.model.idAttribute] = this.model.getId();
    layer.svgStyles = this.extractStyles();
    layer.styleProperties = this.setPathLengths().extractProps();
    layer.content = this.el.innerHTML;

    this.model.trigger('sendCommand', 'updateLayer', {layer: layer, broadcast: true});

    this.model.set('content', layer.content, {silent: true});

    return this;
  },

  initialize: function(options) {
    this.model = options.model;
    this.el = document.createElement('div');
    this.listenToAndRun(this.model, 'change:content', this._updateContent);
  }
});
module.exports = Extractor;