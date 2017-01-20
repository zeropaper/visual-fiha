'use strict';
var _ids = 0;
var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.types.SVG = ScreenLayerView.extend({
  autoRender: true,

  template: function() {
    return '<div class="layer-svg" layer-id="' + this.model.cid + '" view-id="' + this.cid + '"></div>';
  },

  // bindings: require('lodash.assign')({
  // }, ScreenLayerView.prototype.bindings),


  // derived: {
  //   styleEl: {
  //     deps: ['model.src'],
  //     fn: function() {
  //       var el = document.createElement('style');
  //       el.id = this.cid;
  //       document.head.appendChild(el);
  //       return el;
  //     }
  //   }
  // },

  extractStyles: function() {
    var self = this;
    this.queryAll('[style]').forEach(function(el) {
      if (!el.id) {
        _ids++;
        el.id = 'auto-svg-id-' + _ids;
      }

      self.addRule('#' + el.id, el.getAttribute('style'));
      el.removeAttribute('style');
    });
    return this;
  },

  editStyles: function() {

  },

  loadSVG: function() {
    var view = this;
    var src = view.model.src;
    var el = view.el;
    if (!src || !el) {
      return;
    }

    fetch(src)
    .then(function(response) {
      return response.text();
    })
    .then(function(txt) {
      el.innerHTML = txt;
      view.extractStyles();
    });
  },

  initialize: function() {
    ScreenLayerView.prototype.initialize.apply(this, arguments);
    this.on('change:rendered', this.loadSVG);
    this.listenToAndRun(this.model, 'change:src', this.loadSVG);
  },

  remove: function() {
    var style = this.styleEl;
    style.parentNode.removeChild(style);
    ScreenLayerView.prototype.remove.apply(this, arguments);
  },

  render: function() {
    if (this.el) {
      return this;
    }

    this.renderWithTemplate();
    return this;
  }
});