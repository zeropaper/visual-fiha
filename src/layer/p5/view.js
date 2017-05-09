'use strict';
var LayerView = require('./../view');
var p5 = require('p5');

function compileSketch(setupFunction, updateFunction) {
  var fn;// jshint ignore:line

  var evaled = `(function() {
  // override some stuff that should not be used
  var navigator, window, global, document, module, exports;

  return function sketch(p) {
    var layer = this;
    var screen = layer.model.screenState || {};
    var width = layer.width || screen.width || 400;
    var height = layer.height || screen.height || 300;
    var store = layer.cache;
    var audio = layer ? layer.audio : {};
    var bufferLength = function() { return ((layer.audio || {}).bufferLength) || 128; };
    var frequency = function(x) {
      return ((layer.audio || {}).frequency || [])[x] || 0;
    };
    var timeDomain = function(x) {
      return ((layer.audio || {}).timeDomain || [])[x] || 0;
    };

    var parameter = function(name, defaultVal) {
      return layer.model.parameters.getValue(name)
    };

    p.setup = function() {
      p.createCanvas(width, height);
      try {
        ${ setupFunction.toString() }
      } catch (e) {}
      p.noLoop();
    };

    p.draw = function() {
      var frametime = screen.clock.frametime || 0;
      try {
        ${ updateFunction.toString() }
      } catch(e) {}
    };
  };
})();`;

  try {
    fn = eval(evaled);// jshint ignore:line
  }
  catch (err) {
    return function sketchError(p) {
      var layer = this;
      p.setup = function() {
        console.warn('sketch error for %s: %s', layer.model.getId(), err.message);
      };
      p.draw = function() {};
    };
  }
  return fn;
}


var P5LayerView = LayerView.types.p5 = LayerView.extend({
  autoRender: true,

  template: function() {
    return '<div class="layer-p5" id="' + this.model.getId() + '" view-id="' + this.cid + '"></div>';
  },

  derived: {
    p5: {
      deps: [
        'width',
        'height',
        'el',
        'sketch'
      ],
      fn: function() {
        if (!this.el) return;
        var sketch = this.sketch;
        if (this._cache.p5 && typeof this._cache.p5.remove === 'function') {
          this._cache.p5.remove();
        }
        this.queryAll('canvas').forEach(cnv => cnv.parentNode.removeChild(cnv));
        return new p5(sketch, this.el);
      }
    },
    draw: {
      deps: [
        'model.updateFunction'
      ],
      fn: function() {
        var sketch = compileSketch(this.model.setupFunction, this.model.updateFunction).bind(this);// jshint ignore:line
        sketch(this.p5);
        return this.p5.draw;
      }
    },
    sketch: {
      deps: [
        'model.setupFunction'
      ],
      fn: function() {
        return compileSketch(this.model.setupFunction, this.model.updateFunction).bind(this);
      }
    }
  },

  update: function() {
    this.p5.redraw();
  },

  remove: function() {
    LayerView.prototype.remove.apply(this, arguments);
    if (this._cache.p5 && typeof this._cache.p5.remove === 'function') {
      this._cache.p5.remove();
    }
  }
});
module.exports = P5LayerView;