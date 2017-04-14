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
    },
    styleEl: {
      deps: ['model.content'],
      fn: function() {
        var id = this.model.getId();
        var el = document.getElementById('style-' + id);
        if (!el) {
          el = document.createElement('style');
          el.id = 'style-' + id;
          el.appendChild(document.createTextNode(''));
          document.head.appendChild(el);
        }
        return el;
      }
    },
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
  }
});
