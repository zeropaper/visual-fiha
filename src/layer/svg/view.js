'use strict';
var _ids = 0;
var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.SVG = ScreenLayerView.extend({
  autoRender: true,

  template: function() { return '<div class="layer-svg" layer-id="' + this.model.cid + '" view-id="' + this.cid + '"></div>'; },

  derived: {
    styleEl: {
      deps: ['model.src'],
      fn: function() {
        var el = document.createElement('style');
        el.id = this.cid;
        document.head.appendChild(el);
        return el;
      }
    }
  },

  bindings: VFDeps.assign({
  }, ScreenLayerView.prototype.bindings),

  extractStyles: function() {
    var viewId = this.cid;
    var style = this.styleEl;
    this.queryAll('[style]').forEach(function(el) {
      var elStyle = el.getAttribute('style');

      if (!el.id) {
        _ids++;
        el.id = 'auto-svg-id-' + _ids;
      }

      style.innerHTML += '\n/* '+ el.id +' */\n [view-id="' + viewId + '"] #' + el.id + ' {\n' + elStyle.split(';').join(';\n  ') + '\n}';
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
      // console.info('loadSVG, no src? %s, no el? %s', src, el);
      return;
    }

    fetch(src)
    .then(function(response) {
      return response.text();
    })
    .then(function(txt) {
      el.innerHTML = txt;
      console.info('fetched %s', src, txt.length);
      view.extractStyles();
    });
  },

  initialize: function() {
    ScreenLayerView.prototype.initialize.apply(this, arguments);
    this.on('change:rendered', this.loadSVG);
    this.listenToAndRun(this.model, 'change:src', this.loadSVG);
  },

  remove: function() {
    var style = this.styleEl;//document.getElementById(this.cid);
    console.info('remove svg style element', style);
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