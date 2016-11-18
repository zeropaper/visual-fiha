'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.SVG = ScreenLayerView.extend({
  autoRender: true,

  template: function() { return '<div class="layer-svg" layer-id="' + this.model.cid + '" view-id="' + this.cid + '"></div>'; },

  bindings: VFDeps.assign({
    width: {
      name: 'width',
      type: 'attribute'
    },
    height: {
      name: 'height',
      type: 'attribute'
    }
  }, ScreenLayerView.prototype.bindings),

  extractStyles: function() {
    var viewId = this.cid;
    var style = document.getElementById(this.cid);
    this.queryAll('[style]').forEach(function(el) {
      var elStyle = el.getAttribute('style');
      console.info('svg element %s with style', el.id, elStyle.length);
      if (!el.id) {
        // should generate an id!
        return;
      }

      style.innerHTML += '\n/* '+ el.id +' */\n [view-id="' + viewId + '"] #' + el.id + ' {\n' + elStyle + '\n}';
      el.removeAttribute('style');
    });
    return this;
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
    var style = document.getElementById(this.cid);
    console.info('remove svg style element', style);
    style.parentNode.removeChild(style);
    ScreenLayerView.prototype.remove.apply(this, arguments);
  },

  render: function() {
    if (this.el) {
      // console.info('svg el exists for %s', this.cid, this.model.cid);
      return this;
    }
    var style = document.createElement('style');
    style.id = this.cid;
    document.head.appendChild(style);
    this.renderWithTemplate();
    return this;
  }
});