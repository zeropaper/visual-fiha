'use strict';
var View = window.VFDeps.View;
var LayerView = require('./../layer/view');
require('./../layer/canvas/view');
require('./../layer/svg/view');
require('./../layer/video/view');
require('./../layer/img/view');



var ScreenView = View.extend({
  autoRender: true,

  template: '<div class="screen"></div>',

  derived: {
    signalNames: {
      deps: ['screenSignals', 'MIDIAccess'],
      fn: function() {
        var mic = [];
        if (this.audioAnalyser) {
          for (var i = 0; i < this.audioAnalyser.frequencyBinCount; i++) {
            mic.push('mic:' + i);
          }
        }
        var signals = this.model.screenSignals
          .map(function(m) {
            return m.name;
          })
          .concat(this.MIDIAccess ? this.MIDIAccess.signalNames : [], mic);
        return signals;
      }
    }
  },

  props: {
  },

  session: {
    width: ['number', true, 400],
    height: ['number', true, 300],
    frametime: ['number', true, 0],
    firstframetime: ['any', true, function () {
      return performance.now();
    }],
    ratio: {
      type: 'number',
      required: true,
      default: 4/3,
      values: [0, 4/3, 16/9]
    },
    MIDIAccess: 'state',
    captureMouse: ['boolean', true, false],
    captureDebug: ['boolean', true, false],
    mode: {
      type: 'string',
      required: true,
      default: 'screen',
      values: ['screen', 'control']
    }
  },

  initialize: function () {
    var screenView = this;
    if (!screenView.model) {
      throw new Error('Missing model option for ScreenView');
    }

    if (window.BroadcastChannel) {
      var channel = screenView.channel = new window.BroadcastChannel('vf_bus');
      channel.onmessage = function(e) {
        e.data.latency = performance.now() - e.timeStamp;
        // console.info('update for %s, %s', screenView.cid, e.data.latency);
        screenView.update(e.data);
      };
    }
  },

  remove: function() {
    if (this.channel) {
      this.channel.close();
    }
    return View.prototype.remove.apply(this, arguments);
  },

  resize: function (p) {
    if (!this.el) { return this; }

    if (this.mode === 'screen') {
      this.el.style.position = 'fixed';
      this.el.top = 0;
      this.el.left = 0;
      this.el.style.width = '100%';
      this.el.style.height = '100%';
      this.width = this.el.clientWidth;
      this.height = this.el.clientHeight;
      return this.resizeLayers();
    }

    p = p || this.el.parentNode;
    if (p && p.clientWidth) {
      this.width = p.clientWidth;
      var r = this.ratio || 4/3;
      this.height = Math.floor(this.width / r);
      this.el.style.width = this.width + 'px';
      this.el.style.height = this.height + 'px';
    }
    return this.resizeLayers();
  },

  resizeLayers: function() {
    if (!this.layersView || !this.layersView.views) { return this; }
    this.layersView.views.forEach(function(view) {
      view.width = this.width;
      view.height = this.height;
    }, this);
    return this;
  },

  render: function() {
    this.renderWithTemplate();
    this.layersView = this.renderCollection(this.model.screenLayers, function(opts) {
      var type = opts.model.getType();
      var ScreenLayerConstructor = LayerView[type] || LayerView;
      return new ScreenLayerConstructor(opts);
    }, this.el, {parent: this});
    return this.resize();
  },

  update: function(options) {
    if (!this.layersView) {
      return this.render().update(options);
    }

    this.model.set(options);

    function findLayer(name) {
      return function(lo) {
        return lo.name === name;
      };
    }

    var triggerChange;
    var collection = this.model.screenLayers;
    if (options.screenLayers) {
      options.screenLayers.forEach(function(layer) {
        triggerChange = true;
        var state = collection.get(layer.name);
        if (state) {
          state.set(layer, {
            silent: true
          });
        }
        else {
          collection.add(layer, {
            silent: true
          });
        }
      });

      collection.forEach(function(layer) {
        var found = options.screenLayers.find(findLayer(layer.name));
        if (!found) {
          triggerChange = true;
          collection.remove(layer, {
            silent: true
          });
        }
      });

      if (triggerChange) {
        this.trigger('change:screenLayers', collection);
      }
    }

    this.layersView.views.forEach(function(subview) {
      subview.update();
    });

    return this;
  }
});
module.exports = ScreenView;