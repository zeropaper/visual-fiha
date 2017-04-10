'use strict';
var ScreenLayerView = require('./../view');

module.exports = ScreenLayerView.types.SVG = ScreenLayerView.extend({
  autoRender: true,

  template: function() {
    return '<div class="layer-svg" id="' + this.model.getId() + '" view-id="' + this.cid + '"></div>';
  },

  derived: {
    svg: {
      deps: ['el', 'model.content'],
      fn: function() {
        return this.el && this.model.content ? this.query('svg') || false : false;
      }
    }
  },

  updateStyles: function() {
    if (!this.model.active || !this.el) return this;
    var selectors = Object.keys(this.model.svgStyles);
    selectors.forEach(function(selector) {
      this.addRule('>svg ' + selector, this.model.svgStyles[selector]);
    }, this);
    return this;
  },

  updateProperties: function() {
    if (!this.model.active || !this.el) return this;
    this.model.styleProperties.forEach(function(styleProp) {
      this.setProperty(styleProp.name, styleProp.value);
    }, this);
    return this;
  },

  updateContent: function() {
    if (!this.el || this.el.innerHTML === this.model.content) return this;

    this.el.innerHTML = this.model.content;
    this.updateStyles().updateProperties();
  },

  initialize: function() {
    ScreenLayerView.prototype.initialize.apply(this, arguments);
    this.updateContent().updateStyles().updateProperties();

    this.listenTo(this.model, 'change:content', this.updateContent);
    this.on('change:el', this.updateContent);

    this.listenToAndRun(this.model, 'change:svgStyles', this.updateStyles);
    this.listenToAndRun(this.model.styleProperties, 'add remove change', this.updateProperties);
  },

  addRule: function(selector, properties) {
    ScreenLayerView.prototype.addRule.call(this, selector, properties);
    return this;
  },

  remove: function() {
    var style = this.styleEl;
    if (style && style.parentNode) style.parentNode.removeChild(style);
    ScreenLayerView.prototype.remove.apply(this, arguments);
  }
});
