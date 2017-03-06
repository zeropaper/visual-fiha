'use strict';
var ScreenLayerView = require('./../view');

module.exports = ScreenLayerView.types.SVG = ScreenLayerView.extend({
  autoRender: true,

  template: function() {
    return '<div class="layer-svg" layer-id="' + this.model.cid + '" view-id="' + this.cid + '"></div>';
  },

  _updateContent: function() {
    if (!this.el) return;
    this.el.innerHTML = this.model.content;
    this.svg = this.query('svg');
    if (!this.svg) return;

    this.svg.style = null;
    this.svg.querySelectorAll('[style][id]').forEach(function(el) {
      el.style = null;
    });

    return this._updateStyles()._updateProperties();
  },

  _updateStyles: function() {
    var selectors = Object.keys(this.model.svgStyles);
    selectors.forEach(function(selector) {
      this.addRule(selector, this.model.svgStyles[selector]);
    }, this);
    return this;
  },

  _updateProperties: function() {
    if (!this.el) return this;
    var svg = this.query('svg');
    if (!svg || !svg.style) return this;

    this.model.styleProperties.forEach(function(styleProp) {
      this.setProperty(styleProp.name, styleProp.value);
    }, this);

    var paths = this.svg.querySelectorAll('path');
    for (var p = 0; p < paths.length; p++) {
      paths[p].style.setProperty('--path-length', paths[p].getTotalLength());
    }

    return this;
  },

  initialize: function() {
    this.listenToAndRun(this.model, 'change:content', this._updateContent);
    this.listenToAndRun(this.model, 'change:svgStyles', this._updateStyles);
    this.listenToAndRun(this.model, 'change:styleProperties', this._updateProperties);
  },

  remove: function() {
    var style = this.styleEl;
    if (style && style.parentNode) style.parentNode.removeChild(style);
    ScreenLayerView.prototype.remove.apply(this, arguments);
  }
});